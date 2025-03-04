import { decodeJwt } from 'jose'
import { logger } from '@navikt/next-logger'

import { getSession } from '@fhir/auth/session'
import { FhirDocumentReference, FhirDocumentReferenceResponseSchema } from '@fhir/fhir-data/schema/documentReference'

import { FhirPractitionerSchema } from '../fhir-data/schema/practitioner'
import { getHpr } from '../fhir-data/schema/mappers/practitioner'
import { getName } from '../fhir-data/schema/mappers/patient'
import { BehandlerInfo } from '../../data-fetcher/data-service'

/**
 * These FHIR resources are only available in the server runtime. They are not proxied through the backend.
 * They will use the session store and fetch resources directly from the FHIR server.
 */
export const serverFhirResources = {
    createDocumentReference: async (pdf: string) => {
        const currentSession = await getSession()
        if (currentSession == null) {
            throw new Error('Active session is required')
        }

        const decodedIdToken = decodeJwt(currentSession.idToken)
        // TODO: fix webmed fallback - practitioner should not be used

        const practitionerId = currentSession.webmedPractitioner
            ? `Practitioner/${currentSession.webmedPractitioner}`
            : decodedIdToken.fhirUser

        const patientId = currentSession.patient

        const encounterId = currentSession.encounter

        if (typeof practitionerId !== 'string') {
            throw new Error('practitionerId is not string')
        }
        const documentReference = getDocRefWithB64Data(practitionerId, patientId, encounterId, pdf)

        const documentReferenceResponse = await fetch(`DocumentReference/`, {
            method: 'POST',
            body: JSON.stringify(documentReference),
            headers: {
                Authorization: `Bearer ${currentSession.accessToken}`,
                ContentType: 'application/fhir+json',
            },
        })

        if (!documentReferenceResponse.ok) {
            logger.error('Request to create DocumentReference failed', documentReferenceResponse)
            if (documentReferenceResponse.headers.get('Content-Type')?.includes('text/plain')) {
                const text = await documentReferenceResponse.text()
                logger.error(`Request to create DocumentReference failed with text: ${text}`)
            } else if (documentReferenceResponse.headers.get('Content-Type')?.includes('application/json')) {
                const json = await documentReferenceResponse.json()
                logger.error(`Request to create DocumentReference failed with json: ${JSON.stringify(json)}`)
            }

            throw new Error('Unable to create DocumentReference')
        }

        const docRefResult = await documentReferenceResponse.json()
        const parsedDocRefResult = FhirDocumentReferenceResponseSchema.safeParse(docRefResult)
        if (!parsedDocRefResult.success) {
            throw new Error('DocumentReference was not a valid FhirDocumentReference', {
                cause: parsedDocRefResult.error,
            })
        }

        return parsedDocRefResult.data
    },

    getBehandlerInfo: async (): Promise<BehandlerInfo> => {
        const currentSession = await getSession()
        if (currentSession == null) {
            throw new Error('Active session is required')
        }

        const decodedIdToken = decodeJwt(currentSession.idToken)
        // TODO: fix webmed fallback - practitioner should not be used
        const fhirUser = currentSession.webmedPractitioner
            ? `Practitioner/${currentSession.webmedPractitioner}`
            : decodedIdToken.fhirUser
        const fhirUserResourcePath = `${currentSession.issuer}/${fhirUser}`

        logger.info(`Trying to fetch fhirUser from ${fhirUserResourcePath}`)
        const fhirUserResponse = await fetch(fhirUserResourcePath, {
            headers: {
                Authorization: `Bearer ${currentSession.accessToken}`,
            },
        })
        if (!fhirUserResponse.ok) {
            logger.error(
                `fhirUser resource failed, responed with ${fhirUserResponse.status} ${fhirUserResponse.statusText}`,
            )
            if (fhirUserResponse.headers.get('Content-Type')?.includes('text/plain')) {
                const text = await fhirUserResponse.text()
                logger.error(`fhirUser resource failed with text: ${text}`)
            } else if (fhirUserResponse.headers.get('Content-Type')?.includes('application/json')) {
                const json = await fhirUserResponse.json()
                logger.error(`fhirUser resource failed with json: ${JSON.stringify(json)}`)
            }

            throw new Error('Unable to get fhirUser')
        }

        const fhirUserResult = await fhirUserResponse.json()
        const parsedFhirUser = FhirPractitionerSchema.safeParse(fhirUserResult)
        if (!parsedFhirUser.success) {
            throw new Error('fhirUser was not a valid FhirPractitioner', {
                cause: parsedFhirUser.error,
            })
        }

        const hpr = getHpr(parsedFhirUser.data.identifier)
        if (hpr == null) {
            // TODO: Don't log name?
            throw new Error(`Practitioner without HPR (${parsedFhirUser.data.name})`)
        }

        return {
            navn: getName(parsedFhirUser.data.name),
            epjDescription: 'Fake EPJ V0.89',
            hpr: hpr,
            autorisasjoner: [],
        }
    },
}

function getDocRefWithB64Data(
    patientId: string,
    practitionerId: string,
    encounterId: string,
    pdf: string,
): FhirDocumentReference {
    return {
        resourceType: 'DocumentReference',
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
        description: 'My cool document description with a b64 data',
        content: [
            {
                attachment: {
                    title: 'My cool sykmelding document',
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
