import { ReadyClient, ResourceCreateErrors } from '@navikt/smart-on-fhir/client'
import { FhirDocumentReference, FhirQuestionnaireResponse } from '@navikt/smart-on-fhir/zod'
import { Span } from '@opentelemetry/api'
import { logger } from '@navikt/next-logger'

import { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { failSpan, spanServerAsync } from '@lib/otel/server'
import { getFlag, UnleashClient } from '@core/toggles/unleash'
import { generatePdf } from '@data-layer/fhir/write/pdf-service'

import { sykmeldingToDocumentReference } from './mappers/document-reference'
import { sykmeldingToQuestionnaireResponse } from './mappers/questionnaire-response'

type FhirWriteOutcomes =
    | {
          result: 'ALREADY_CREATED' | 'CREATED'
      }
    | {
          error: 'UNABLE_TO_VERIFY_IF_EXISTS' | 'UNABLE_TO_CREATE'
      }

export const fhirWriteService = (client: ReadyClient, unleash: UnleashClient) =>
    ({
        writeDocumentReference: async (sykmelding: SykInnApiSykmelding, hpr: string): Promise<FhirWriteOutcomes> => {
            return spanServerAsync('FhirWriteService.writeDocumentReference', async (span) => {
                const sykmeldingId = sykmelding.sykmeldingId

                const alreadyExists = resourceAlreadyExists(client, { type: 'DocumentReference', id: sykmeldingId })
                if ('error' in alreadyExists) return { error: 'UNABLE_TO_VERIFY_IF_EXISTS' }

                const pdfBuffer = await generatePdf(sykmelding, hpr)
                if ('error' in pdfBuffer) {
                    failSpan(span, `Failed to generate PDF for DocumentReference(${sykmeldingId}): ${pdfBuffer.error}`)
                    return { error: 'UNABLE_TO_CREATE' }
                }

                const payload: FhirDocumentReference = sykmeldingToDocumentReference(sykmelding, pdfBuffer, {
                    encounterId: client.encounter.id,
                    patientId: client.patient.id,
                    practitionerId: client.user.id,
                })
                const createdDocumentReference: FhirDocumentReference | ResourceCreateErrors = await client.update(
                    'DocumentReference',
                    { id: sykmelding.sykmeldingId, payload: payload },
                )

                if ('error' in createdDocumentReference) {
                    failSpan(
                        span,
                        `Failed to create DocumentReference(${sykmeldingId}): ${createdDocumentReference.error}`,
                    )
                    return { error: 'UNABLE_TO_CREATE' }
                }

                sanityCheckDocumentReferenceId(span, sykmelding, createdDocumentReference)

                return { result: 'CREATED' }
            })
        },
        writeQuestionnaireResponse: async (sykmelding: SykInnApiSykmelding): Promise<FhirWriteOutcomes> => {
            return spanServerAsync('FhirWriteService.writeQuestionnaireResponse', async (span) => {
                const questionnaireEnabled = getFlag('SYK_INN_STRUCTURED_FHIR', unleash)
                span.setAttribute('fhir-write.questionnaire-response-toggle', questionnaireEnabled)

                if (!questionnaireEnabled) {
                    logger.info('QuestionnaireResponse creation is toggled off. Skipping.')

                    // Pretend everything went fine if toggle is off
                    return { result: 'ALREADY_CREATED' }
                }

                const sykmeldingId = sykmelding.sykmeldingId
                const alreadyExists = resourceAlreadyExists(client, { type: 'QuestionnaireResponse', id: sykmeldingId })
                if ('error' in alreadyExists) return { error: 'UNABLE_TO_VERIFY_IF_EXISTS' }

                const payload: FhirQuestionnaireResponse = sykmeldingToQuestionnaireResponse(sykmelding, {
                    encounterId: client.encounter.id,
                    patientId: client.patient.id,
                    practitionerId: client.user.id,
                })
                const createdQuestionnaireResponse = await client.update('QuestionnaireResponse', {
                    id: sykmelding.sykmeldingId,
                    payload: payload,
                })

                if ('error' in createdQuestionnaireResponse) {
                    failSpan(span, `Failed to create QuestionnaireResponse ${createdQuestionnaireResponse.error}`)
                    return { error: 'UNABLE_TO_CREATE' }
                }

                return { result: 'CREATED' }
            })
        },
    }) as const

async function resourceAlreadyExists(
    client: ReadyClient,
    document: {
        type: 'DocumentReference' | 'QuestionnaireResponse'
        id: string
    },
): Promise<true | { error: string }> {
    return spanServerAsync(`FhirWriteService.resourceAlreadyExists(${document.type}/${document.id})`, async (span) => {
        const existingResource = await client.request(`${document.type}/${document.id}`, {
            expectNotFound: true,
        })

        if ('resourceType' in existingResource || existingResource.error === 'REQUEST_FAILED_RESOURCE_NOT_FOUND') {
            return true
        }

        failSpan(
            span,
            'Unable to verify if resource exists',
            new Error(`Error checking existence of ${document.type}/${document.id}: ${existingResource.error}`),
        )
        return { error: existingResource.error }
    })
}

/**
 * Verify that the ID returned by the FHIR server is the same as the one we provided in the PUT.
 *
 * If they differ, the FHIR server has messed up their HTTP PUT implementation.
 */
function sanityCheckDocumentReferenceId(
    span: Span,
    sykmelding: SykInnApiSykmelding,
    createdDocumentReference: FhirDocumentReference,
): void {
    if (createdDocumentReference.id !== sykmelding.sykmeldingId) {
        failSpan(
            span,
            'DocumentReference ID create mismatch',
            new Error(
                `Created DocumentReference ID (${createdDocumentReference.id}) does not match the sykmelding ID (${sykmelding.sykmeldingId})`,
            ),
        )
    }
}
