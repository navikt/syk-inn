import { logger } from '@navikt/next-logger'

import { FhirDocumentReference, FhirDocumentReferenceBase } from '@navikt/fhir-zod'
import { ResourceRequestErrors, SmartClientReadyErrors, ResourceCreateErrors } from '@navikt/smart-on-fhir/client'
import { getHpr } from '@fhir/fhir-data/mappers/practitioner'
import { getName } from '@fhir/fhir-data/mappers/patient'
import { getReadyClient } from '@fhir/smart-client'

import { BehandlerInfo } from '../../data-layer/data-fetcher/data-service'
import { withSpanAsync } from '../../otel/otel'

/**
 * These FHIR resources are only available in the server runtime. They are not proxied through the backend.
 * They will use the session store and fetch resources directly from the FHIR server.
 */
export const serverFhirResources = {
    createDocumentReference: withSpanAsync(
        'fhir create document reference',
        async (
            pdf: string,
            title: string,
            sykmeldingId: string,
        ): Promise<FhirDocumentReferenceBase | SmartClientReadyErrors | ResourceCreateErrors> => {
            const client = await getReadyClient({ validate: true })
            if ('error' in client) {
                return { error: client.error }
            }

            const practitionerId = client.fhirUser
            const patientId = client.patient
            const encounterId = client.encounter

            const documentReferencePayload = prepareDocRefWithB64Data({
                title,
                pdf,
                sykmeldingId,
                encounterId,
                patientId,
                practitionerId,
            })

            const createResult = await client.create('/DocumentReference', {
                payload: documentReferencePayload,
            })

            if ('error' in createResult) {
                logger.error('Failed to create DocumentReference', createResult.error)
                return createResult
            }

            return createResult
        },
    ),

    getDocumentReference: withSpanAsync(
        'fhir document by id',
        async (
            sykmeldingId: string,
        ): Promise<FhirDocumentReferenceBase | SmartClientReadyErrors | ResourceRequestErrors> => {
            const client = await getReadyClient({ validate: true })
            if ('error' in client) {
                return { error: client.error }
            }

            const resourcePath = `/DocumentReference/${sykmeldingId}` as const
            logger.info(`Resource path: ${resourcePath}`)
            const documentReference = await client.request(resourcePath)

            if ('error' in documentReference) {
                return { error: documentReference.error }
            }

            return documentReference
        },
    ),

    getBehandlerInfo: withSpanAsync('fhir behandler', async (): Promise<BehandlerInfo> => {
        const client = await getReadyClient({ validate: true })
        if ('error' in client) {
            throw new Error(`Unable to get fhirUser, cause: ${client.error}`)
        }

        if (!client.fhirUser.startsWith('Practitioner/')) {
            logger.error(`fhirUser is not a Practitioner, was: ${client.fhirUser}`)
            throw new Error('fhirUser is not a Practitioner')
        }

        logger.info(`Trying to fetch fhirUser from /Practitioner/${client.fhirUser}`)
        const practitionerResponse = await client.request(`/${client.fhirUser}` as `/Practitioner/${string}`)

        if ('error' in practitionerResponse) {
            throw new Error(`Unable to fetch 'behandler', reason: ${practitionerResponse.error}`)
        }

        const hpr = getHpr(practitionerResponse.identifier)
        if (hpr == null) {
            // TODO: Don't log name? :shrug:
            throw new Error(`Practitioner without HPR (${practitionerResponse.name})`)
        }

        return {
            navn: getName(practitionerResponse.name),
            epjDescription: 'Fake EPJ V0.89',
            hpr: hpr,
            autorisasjoner: [],
        }
    }),
}

type PrepareDocRefOpts = {
    patientId: string
    practitionerId: string
    encounterId: string
    pdf: string
    title: string
    sykmeldingId: string
}

function prepareDocRefWithB64Data({
    patientId,
    practitionerId,
    encounterId,
    pdf,
    title,
    sykmeldingId,
}: PrepareDocRefOpts): Omit<FhirDocumentReference, 'meta'> {
    return {
        resourceType: 'DocumentReference',
        id: sykmeldingId,
        status: 'current',
        type: {
            coding: [
                {
                    system: 'urn:oid:2.16.578.1.12.4.1.1.9602',
                    code: 'J01-2',
                    display: 'Sykmeldinger og trygdesaker',
                },
            ],
        },
        subject: {
            reference: `Patient/${patientId}`,
        },
        author: [
            {
                reference: `Practitioner/${practitionerId}`,
            },
        ],
        content: [
            {
                attachment: {
                    title: title,
                    language: 'NO-nb',
                    contentType: 'application/pdf',
                    data: pdf,
                },
            },
        ],
        context: {
            encounter: [
                {
                    reference: `Encounter/${encounterId}`,
                },
            ],
        },
    }
}
