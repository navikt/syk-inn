import { decodeJwt } from 'jose'
import { logger } from '@navikt/next-logger'

import { getSession } from '@fhir/auth/session'

import { FhirPractitionerSchema } from '../fhir-data/schema/practitioner'
import { getHpr } from '../fhir-data/schema/mappers/practitioner'
import { getName } from '../fhir-data/schema/mappers/patient'
import { BehandlerInfo } from '../../data-fetcher/data-service'

/**
 * These FHIR resources are only available in the server runtime. They are not proxied through the backend.
 * They will use the session store and fetch resources directly from the FHIR server.
 */
export const serverFhirResources = {
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
