import { ReadyClient } from '@navikt/smart-on-fhir/client'
import { FhirPractitioner } from '@navikt/smart-on-fhir/zod'

import { createDocumentReference } from '@data-layer/fhir/fhir-service'
import { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { failSpan, spanServerAsync } from '@lib/otel/server'

type FhirWriteOutcomes =
    | {
          result: 'ALREADY_CREATED' | 'CREATED'
      }
    | {
          error: 'UNABLE_TO_VERIFY_IF_EXISTS' | 'UNABLE_TO_CREATE'
      }

export const fhirWriteService = (client: ReadyClient) =>
    ({
        writeDocumentReference: async (
            sykmelding: SykInnApiSykmelding,
            practitioner: FhirPractitioner,
        ): Promise<FhirWriteOutcomes> => {
            return spanServerAsync('FhirWriteService.writeDocumentReference', async (span) => {
                const sykmeldingId = sykmelding.sykmeldingId
                const existingDocument = await client.request(`DocumentReference/${sykmeldingId}`, {
                    expectNotFound: true,
                })

                if ('resourceType' in existingDocument) return { result: 'ALREADY_CREATED' }
                if (existingDocument.error !== 'REQUEST_FAILED_RESOURCE_NOT_FOUND') {
                    failSpan(
                        span,
                        `Unable to check if DocumentReference(${sykmeldingId}) exists: ${existingDocument.error}`,
                    )
                    return { error: 'UNABLE_TO_VERIFY_IF_EXISTS' }
                }

                const createResult = await createDocumentReference(client, sykmelding, practitioner)
                if ('error' in createResult) {
                    failSpan(span, `Unable to create DocumentReference(${sykmeldingId}): ${createResult.error}`)
                    return { error: 'UNABLE_TO_CREATE' }
                }

                return { result: 'CREATED' }
            })
        },
    }) as const
