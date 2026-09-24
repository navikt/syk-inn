import { logger } from '@navikt/next-logger'
import type { ReadyClient, ResourceCreateErrors, ResourceRequestErrors } from '@navikt/smart-on-fhir/client'
import type { FhirDocumentReference, FhirQuestionnaireResponse } from '@navikt/smart-on-fhir/zod'
import { flagsClient } from '@unleash/nextjs'
import { beforeEach, describe, expect, test, vi } from 'vitest'

import { EXPECTED_TOGGLES, ExpectedToggles } from '#core/toggles/toggles'
import { UnleashClient } from '#core/toggles/unleash'
import { SykmeldingBuilder } from '#dev/mock-engine/scenarios/SykInnApiSykmeldingBuilder'

import { fhirWriteService } from './fhir-write-service'

interface LoggerMock {
    info: () => void
    error: () => void
    warn: () => void
    debug: () => void
    child: () => LoggerMock
}

vi.mock('@navikt/next-logger', () => {
    const loggerMock: LoggerMock = {
        info: vi.fn<() => void>(),
        error: vi.fn<() => void>(),
        warn: vi.fn<() => void>(),
        debug: vi.fn<() => void>(),
        child: () => loggerMock,
    }
    return { logger: loggerMock }
})

vi.mock('#core/pdf/pdf-service', () => ({
    createTypstSykmelding: vi.fn<() => Promise<{ ok: true; pdf: ArrayBuffer }>>().mockResolvedValue({
        ok: true,
        pdf: new ArrayBuffer(0),
    }),
}))

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

type MockRequest = () => Promise<ResourceRequestErrors | FhirDocumentReference | FhirQuestionnaireResponse>
type MockUpdate = () => Promise<ResourceCreateErrors | FhirDocumentReference | FhirQuestionnaireResponse>

function mockClient(overrides: { request?: MockRequest; update?: MockUpdate } = {}): ReadyClient {
    return {
        encounter: { id: 'enc-1' },
        patient: { id: 'pat-1' },
        user: { id: 'doc-1' },
        request: overrides.request ?? vi.fn<MockRequest>(),
        update: overrides.update ?? vi.fn<MockUpdate>(),
    } as unknown as ReadyClient
}

function sykmelding(id: string): ReturnType<SykmeldingBuilder['build']> {
    return new SykmeldingBuilder('2020-01-01', id).enkelAktivitet().build()
}

describe('writeDocumentReference idempotency', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('404 on existence check proceeds to PUT', async () => {
        const update = vi.fn<() => Promise<FhirDocumentReference>>().mockResolvedValue({
            resourceType: 'DocumentReference',
            id: 'sykmelding-1',
        } as FhirDocumentReference)
        const client = mockClient({
            request: vi.fn<() => Promise<ResourceRequestErrors>>().mockResolvedValue({
                error: 'REQUEST_FAILED_RESOURCE_NOT_FOUND',
            }),
            update,
        })
        const service = fhirWriteService(client, unleashStub())

        const result = await service.writeDocumentReference(sykmelding('sykmelding-1'), null)

        expect(update).toHaveBeenCalled()
        expect(result).toMatchObject({ result: 'CREATED', selfRef: 'DocumentReference/sykmelding-1' })
    })

    test('2xx on existence check aborts as duplicate', async () => {
        const update = vi.fn<() => Promise<ResourceCreateErrors>>()
        const client = mockClient({
            request: vi.fn<() => Promise<FhirDocumentReference>>().mockResolvedValue({
                resourceType: 'DocumentReference',
                id: 'sykmelding-1',
            } as FhirDocumentReference),
            update,
        })
        const service = fhirWriteService(client, unleashStub())

        const result = await service.writeDocumentReference(sykmelding('sykmelding-1'), null)

        expect(update).not.toHaveBeenCalled()
        expect(result).toMatchObject({ result: 'ALREADY_CREATED', selfRef: 'DocumentReference/sykmelding-1' })
    })

    test('other error on existence check aborts and logs', async () => {
        const update = vi.fn<() => Promise<ResourceCreateErrors>>()
        const client = mockClient({
            request: vi.fn<() => Promise<ResourceRequestErrors>>().mockResolvedValue({
                error: 'REQUEST_FAILED_NON_OK_RESPONSE',
            }),
            update,
        })
        const service = fhirWriteService(client, unleashStub())

        const result = await service.writeDocumentReference(sykmelding('sykmelding-1'), null)

        expect(update).not.toHaveBeenCalled()
        expect(result).toMatchObject({ error: expect.any(String) })
    })

    test('CREATE_FAILED_NOT_SUPPORTED aborts loud and logs error', async () => {
        const update = vi.fn<() => Promise<ResourceCreateErrors>>().mockResolvedValue({
            error: 'CREATE_FAILED_NOT_SUPPORTED',
        })
        const client = mockClient({
            request: vi.fn<() => Promise<ResourceRequestErrors>>().mockResolvedValue({
                error: 'REQUEST_FAILED_RESOURCE_NOT_FOUND',
            }),
            update,
        })
        const service = fhirWriteService(client, unleashStub())

        const result = await service.writeDocumentReference(sykmelding('sykmelding-1'), null)

        expect(update).toHaveBeenCalled()
        expect(result).toMatchObject({ error: 'UNABLE_TO_CREATE' })
        expect(vi.mocked(logger.error)).toHaveBeenCalled()
    })
})

describe('writeQuestionnaireResponse idempotency', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    test('toggle off skips entirely, no request or update', async () => {
        const request = vi.fn<() => Promise<ResourceRequestErrors>>()
        const update = vi.fn<() => Promise<ResourceCreateErrors>>()
        const client = mockClient({ request, update })
        const service = fhirWriteService(client, unleashStub())

        const result = await service.writeQuestionnaireResponse(sykmelding('sykmelding-1'))

        expect(request).not.toHaveBeenCalled()
        expect(update).not.toHaveBeenCalled()
        expect(result).toMatchObject({ result: 'ALREADY_CREATED', selfRef: null })
    })

    test('calls update when toggle is on, 404 on existence check proceeds to PUT', async () => {
        const request = vi.fn<() => Promise<ResourceRequestErrors>>().mockResolvedValue({
            error: 'REQUEST_FAILED_RESOURCE_NOT_FOUND',
        })
        const update = vi.fn<() => Promise<FhirQuestionnaireResponse>>().mockResolvedValue({
            resourceType: 'QuestionnaireResponse',
            id: 'sykmelding-1',
        } as FhirQuestionnaireResponse)
        const client = mockClient({ request, update })
        const service = fhirWriteService(client, unleashStub(['SYK_INN_STRUCTURED_FHIR']))

        const result = await service.writeQuestionnaireResponse(sykmelding('sykmelding-1'))

        expect(update).toHaveBeenCalled()
        expect(result).toMatchObject({ result: 'CREATED', selfRef: 'QuestionnaireResponse/sykmelding-1' })
    })

    test('surfaces an error when update fails, toggle is on', async () => {
        const request = vi.fn<() => Promise<ResourceRequestErrors>>().mockResolvedValue({
            error: 'REQUEST_FAILED_RESOURCE_NOT_FOUND',
        })
        const update = vi.fn<() => Promise<ResourceCreateErrors>>().mockResolvedValue({
            error: 'CREATE_FAILED_NON_OK_RESPONSE',
        })
        const client = mockClient({ request, update })
        const service = fhirWriteService(client, unleashStub(['SYK_INN_STRUCTURED_FHIR']))

        const result = await service.writeQuestionnaireResponse(sykmelding('sykmelding-1'))

        expect(result).toMatchObject({ error: expect.any(String) })
    })

    test('CREATE_FAILED_NOT_SUPPORTED skips silently and reports success', async () => {
        const request = vi.fn<() => Promise<ResourceRequestErrors>>().mockResolvedValue({
            error: 'REQUEST_FAILED_RESOURCE_NOT_FOUND',
        })
        const update = vi.fn<() => Promise<ResourceCreateErrors>>().mockResolvedValue({
            error: 'CREATE_FAILED_NOT_SUPPORTED',
        })
        const client = mockClient({ request, update })
        const service = fhirWriteService(client, unleashStub(['SYK_INN_STRUCTURED_FHIR']))

        const result = await service.writeQuestionnaireResponse(sykmelding('sykmelding-1'))

        expect(update).toHaveBeenCalled()
        expect(result).toMatchObject({ result: 'ALREADY_CREATED', selfRef: null })
        expect(vi.mocked(logger.info)).toHaveBeenCalled()
    })
})
