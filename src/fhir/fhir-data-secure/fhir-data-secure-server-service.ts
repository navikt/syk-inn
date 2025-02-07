import { cookies } from 'next/headers'
import { decodeJwt } from 'jose'

import { getSessionStore } from '@fhir/sessions-secure/session-store'
import { FhirPractitionerSchema } from '@fhir/fhir-data/schema/practitioner'
import { getName } from '@fhir/fhir-data/schema/mappers/patient'
import { getHpr } from '@fhir/fhir-data/schema/mappers/practitioner'

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
    const fhirUserResponse = await fetch(`${currentSession.issuer}/${decodedIdToken.fhirUser}`, {
        headers: {
            Authorization: `Bearer ${currentSession.accessToken}`,
        },
    })
    if (!fhirUserResponse.ok) {
        throw new Error(':(')
    }

    const fhirUserResult = await fhirUserResponse.json()
    const parsedFhirUser = FhirPractitionerSchema.safeParse(fhirUserResult)
    if (!parsedFhirUser.success) {
        throw new Error('Doctor Wrong', {
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
