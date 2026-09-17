import { logger } from '@navikt/next-logger'
import { ReadyClient, ResourceCreateErrors } from '@navikt/smart-on-fhir/client'
import { FhirDocumentReference, FhirQuestionnaireResponse } from '@navikt/smart-on-fhir/zod'
import { Span } from '@opentelemetry/api'

import { createTypstSykmelding } from '#core/pdf/pdf-service'
import { SykInnApiSykmelding } from '#core/services/syk-inn-api/schema/sykmelding'
import { getFlag, UnleashClient } from '#core/toggles/unleash'
import { failSpan, spanServerAsync } from '#lib/otel/server'

import { sykmeldingToDocumentReference } from './mappers/document-reference'
import { sykmeldingToQuestionnaireResponse } from './mappers/questionnaire-response'

/**
 * Outcomes of writing to the FHIR server
 *
 * selfRef: the FHIR resource and id of the created record.
 * For example "DocumentReference/<id>" | "QuestionnaireResponse/<id>"
 */
type FhirWriteOutcomes =
    | {
          result: 'ALREADY_CREATED' | 'CREATED'
          selfRef: string | null
      }
    | {
          error: 'UNABLE_TO_VERIFY_IF_EXISTS' | 'UNABLE_TO_CREATE'
      }

export const fhirWriteService = (client: ReadyClient, unleash: UnleashClient) =>
    ({
        writeDocumentReference: async (
            sykmelding: SykInnApiSykmelding,
            reference: string | null,
        ): Promise<FhirWriteOutcomes> => {
            return spanServerAsync('FhirWriteService.writeDocumentReference', async (span) => {
                const sykmeldingId = sykmelding.sykmeldingId

                const alreadyExists = await safeToWrite(client, {
                    type: 'DocumentReference',
                    id: sykmeldingId,
                })
                if (alreadyExists !== true) return { error: 'UNABLE_TO_VERIFY_IF_EXISTS' }

                const pdf = await createTypstSykmelding(sykmelding)
                if (!pdf.ok) {
                    failSpan(span, `Failed to generate PDF for DocumentReference(${sykmeldingId}): ${pdf.error}`)
                    return { error: 'UNABLE_TO_CREATE' }
                }
                const payload: FhirDocumentReference = sykmeldingToDocumentReference(
                    sykmelding,
                    pdf.pdf,
                    {
                        encounterId: client.encounter.id,
                        patientId: client.patient.id,
                        practitionerId: client.user.id,
                    },
                    reference,
                )
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

                return { result: 'CREATED', selfRef: `DocumentReference/${createdDocumentReference.id}` }
            })
        },
        writeQuestionnaireResponse: async (sykmelding: SykInnApiSykmelding): Promise<FhirWriteOutcomes> => {
            return spanServerAsync('FhirWriteService.writeQuestionnaireResponse', async (span) => {
                const questionnaireEnabled = getFlag('SYK_INN_STRUCTURED_FHIR', unleash)
                span.setAttribute('fhir-write.questionnaire-response-toggle', questionnaireEnabled)

                if (!questionnaireEnabled) {
                    logger.info('QuestionnaireResponse creation is toggled off. Skipping.')

                    // Pretend everything went fine if toggle is off
                    return { result: 'ALREADY_CREATED', selfRef: null }
                }

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

                return { result: 'CREATED', selfRef: `QuestionnaireResponse/${createdQuestionnaireResponse.id}` }
            })
        },
    }) as const

async function safeToWrite(
    client: ReadyClient,
    document: {
        type: 'DocumentReference' | 'QuestionnaireResponse'
        id: string
    },
): Promise<boolean> {
    return spanServerAsync(`FhirWriteService.safeToWrite(${document.type}/${document.id})`, async (span) => {
        const existingResource = await client.request(`${document.type}/${document.id}`, {
            expectNotFound: true,
        })

        // resource already exists = log and skip
        if ('resourceType' in existingResource) {
            logger.error(`Resource ${document.type}/${document.id} already exists, skipping write.`)
            return false
        }

        // resource is not found = proceed
        if (existingResource.error === 'REQUEST_FAILED_RESOURCE_NOT_FOUND') {
            logger.debug(`Writing ${document.type}/${document.id}`)
            return true
        }

        const message = `Unexpected error when checking resource already exists: ${existingResource.error}. Resource: ${document.type}/${document.id}`
        // other = log and skip
        logger.error(message)
        failSpan(span, message)
        return false
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
