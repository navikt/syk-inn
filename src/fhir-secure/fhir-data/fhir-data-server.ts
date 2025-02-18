import { cookies } from 'next/headers'
import { decodeJwt } from 'jose'
import { logger } from '@navikt/next-logger'

import { getSessionStore } from '@fhir-secure/sessions/session-store'
import { FhirPractitionerSchema } from '@fhir/fhir-data/schema/practitioner'
import { getHpr } from '@fhir/fhir-data/schema/mappers/practitioner'
import { getName } from '@fhir/fhir-data/schema/mappers/patient'

import { BehandlerInfo } from '../../data-fetcher/data-service'

export async function getBehandlerFromSecureFhirSession(): Promise<BehandlerInfo> {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('syk-inn-session-id')?.value
    if (sessionId == null) {
        throw new Error('Active session is required')
    }

    const sessionStore = await getSessionStore()
    const currentSession = await sessionStore.getSecureSession(sessionId)

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
}
