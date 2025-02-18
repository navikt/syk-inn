import { cookies } from 'next/headers'
import { logger } from '@navikt/next-logger'

import { getSessionStore } from '@fhir-secure/sessions/session-store'

export async function GET(): Promise<Response> {
    const cookieStore = await cookies()
    const sessionId = cookieStore.get('syk-inn-session-id')?.value

    if (sessionId == null) {
        logger.error(`Missing sessionId cookie, session expired or middleware not middlewaring?`)
        return new Response('No valid session', { status: 401 })
    }

    const sessionStore = await getSessionStore()
    const currentSession = await sessionStore.getSecureSession(sessionId)

    const patientFhirResponse = await fetch(`${currentSession.issuer}/Patient/${currentSession.patient}`, {
        headers: {
            Authorization: `Bearer ${currentSession.accessToken}`,
        },
    })
    const response: unknown = await patientFhirResponse.json()

    return Response.json(response)
}
