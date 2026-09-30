import { MockReadyClient } from '@navikt/smart-on-fhir/test'
import { flagsClient } from '@unleash/nextjs'
import { afterEach, describe, expect, test, vi } from 'vitest'

import { EXPECTED_TOGGLES, ExpectedToggles } from '#core/toggles/toggles'
import { UnleashClient } from '#core/toggles/unleash'
import { SykmeldingBuilder } from '#dev/mock-engine/scenarios/SykInnApiSykmeldingBuilder'

import { fhirWriteService } from './fhir-write-service'
import { sykmeldingToDocumentReference } from './mappers/document-reference'
import { sykmeldingToQuestionnaireResponse } from './mappers/questionnaire-response'

vi.mock('#core/pdf/pdf-service', () => ({
    createTypstSykmelding: vi.fn<() => Promise<{ ok: true; pdf: ArrayBuffer }>>().mockResolvedValue({
        ok: true,
        pdf: new ArrayBuffer(0),
    }),
}))

describe('FHIR Write Service', () => {
    const client = new MockReadyClient({
        encounterId: 'enc-1',
        patientId: 'pat-1',
        userId: 'doc-1',
    })

    afterEach(() => {
        client.reset()
    })

    describe('writeDocumentReference idempotency', () => {
        test('404 on existence check proceeds to PUT', async () => {
            const input = sykmelding('sykmelding-1')
            client.on('DocumentReference').get(input.sykmeldingId).replyNotFound()
            client.onUpdate('DocumentReference', input.sykmeldingId).reply(
                sykmeldingToDocumentReference(
                    input,
                    new ArrayBuffer(0),
                    {
                        encounterId: client.encounter.id,
                        patientId: client.patient.id,
                        practitionerId: client.user.id,
                    },
                    null,
                ),
            )
            const service = fhirWriteService(client, unleashStub())
            const result = await service.writeDocumentReference(input, null)

            expect(result).toMatchObject({ result: 'CREATED', selfRef: 'DocumentReference/sykmelding-1' })
            client.assertAllUsed()
        })

        test('2xx on existence check aborts as duplicate', async () => {
            const input = sykmelding('sykmelding-1')
            client
                .on('DocumentReference')
                .get(input.sykmeldingId)
                .reply(
                    sykmeldingToDocumentReference(
                        input,
                        new ArrayBuffer(0),
                        {
                            encounterId: client.encounter.id,
                            patientId: client.patient.id,
                            practitionerId: client.user.id,
                        },
                        null,
                    ),
                )
            const service = fhirWriteService(client, unleashStub())

            const result = await service.writeDocumentReference(input, null)

            expect(result).toMatchObject({ result: 'ALREADY_CREATED', selfRef: 'DocumentReference/sykmelding-1' })
            client.assertAllUsed()
        })

        test('other error on existence check aborts', async () => {
            client.on('DocumentReference').get('sykmelding-1').replyError({ error: 'REQUEST_FAILED_NON_OK_RESPONSE' })
            const service = fhirWriteService(client, unleashStub())

            const result = await service.writeDocumentReference(sykmelding('sykmelding-1'), null)

            expect(result).toMatchObject({ error: expect.any(String) })
            client.assertAllUsed()
        })

        test('CREATE_FAILED_NOT_SUPPORTED aborts', async () => {
            client.on('DocumentReference').get('sykmelding-1').replyNotFound()
            client.onUpdate('DocumentReference', 'sykmelding-1').replyError({ error: 'CREATE_FAILED_NOT_SUPPORTED' })
            const service = fhirWriteService(client, unleashStub())

            const result = await service.writeDocumentReference(sykmelding('sykmelding-1'), null)

            expect(result).toMatchObject({ error: 'UNABLE_TO_CREATE' })
            client.assertAllUsed()
        })
    })

    describe('writeQuestionnaireResponse idempotency', () => {
        test('toggle off skips entirely, no request or update', async () => {
            const service = fhirWriteService(client, unleashStub())

            const result = await service.writeQuestionnaireResponse(sykmelding('sykmelding-1'))

            expect(result).toMatchObject({ result: 'ALREADY_CREATED', selfRef: null })
            client.assertAllUsed()
        })

        test('calls update when toggle is on, 404 on existence check proceeds to PUT', async () => {
            const input = sykmelding('sykmelding-1')
            client.on('QuestionnaireResponse').get(input.sykmeldingId).replyNotFound()
            client.onUpdate('QuestionnaireResponse', input.sykmeldingId).reply(
                sykmeldingToQuestionnaireResponse(input, {
                    encounterId: client.encounter.id,
                    patientId: client.patient.id,
                    practitionerId: client.user.id,
                }),
            )
            const service = fhirWriteService(client, unleashStub(['SYK_INN_STRUCTURED_FHIR']))

            const result = await service.writeQuestionnaireResponse(input)

            expect(result).toMatchObject({ result: 'CREATED', selfRef: 'QuestionnaireResponse/sykmelding-1' })
            client.assertAllUsed()
        })

        test('surfaces an error when update fails, toggle is on', async () => {
            client.on('QuestionnaireResponse').get('sykmelding-1').replyNotFound()
            client
                .onUpdate('QuestionnaireResponse', 'sykmelding-1')
                .replyError({ error: 'CREATE_FAILED_NON_OK_RESPONSE' })
            const service = fhirWriteService(client, unleashStub(['SYK_INN_STRUCTURED_FHIR']))

            const result = await service.writeQuestionnaireResponse(sykmelding('sykmelding-1'))

            expect(result).toMatchObject({ error: expect.any(String) })
            client.assertAllUsed()
        })

        test('CREATE_FAILED_NOT_SUPPORTED skips and reports success', async () => {
            client.on('QuestionnaireResponse').get('sykmelding-1').replyNotFound()
            client
                .onUpdate('QuestionnaireResponse', 'sykmelding-1')
                .replyError({ error: 'CREATE_FAILED_NOT_SUPPORTED' })
            const service = fhirWriteService(client, unleashStub(['SYK_INN_STRUCTURED_FHIR']))

            const result = await service.writeQuestionnaireResponse(sykmelding('sykmelding-1'))

            expect(result).toMatchObject({ result: 'ALREADY_CREATED', selfRef: null })
            client.assertAllUsed()
        })
    })
})

function unleashStub(enabled: ExpectedToggles[] = []): UnleashClient {
    return flagsClient(
        EXPECTED_TOGGLES.map((name) => ({
            name,
            variant: { name: 'default', enabled: enabled.includes(name) },
            impressionData: false,
            enabled: enabled.includes(name),
        })),
    )
}

function sykmelding(id: string): ReturnType<SykmeldingBuilder['build']> {
    return new SykmeldingBuilder('2020-01-01', id).enkelAktivitet().build()
}
