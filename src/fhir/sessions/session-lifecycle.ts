import { cookies } from 'next/headers'

import { raise } from '@utils/ts'
import { getSessionStore } from '@fhir/sessions/session-store'

/**
 * Save the launched session's issuer to the session store.
 */
export async function saveSessionIssuer(issuer: string): Promise<void> {
    const sessionCookie = (await cookies()).get('syk-inn-session-id')
    const sessionId = sessionCookie?.value ?? null

    if (sessionId == null) {
        raise('User without session ID trying to launch FHIR-session. Is middleware not middlewaring?')
    }

    const sessionStore = await getSessionStore()
    await sessionStore.initSession(sessionId, issuer)
}

/**
 * Mark the current session as completed, i.e. that the user has authenticated with the FHIR server and returned to us.
 */
export async function saveSessionCompleted(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    accessToken: string,
): Promise<void> {
    const sessionId = (await cookies()).get('syk-inn-session-id')?.value ?? null

    if (sessionId == null) {
        raise('User without session ID trying to launch FHIR-session. Is middleware not middlewaring?')
    }

    const sessionStore = await getSessionStore()
    if (!(await sessionStore.isSessionInitiated(sessionId))) {
        raise('User trying to authenticate without having launched a session, that is illegal.')
    }

    await sessionStore.completeAuth(sessionId)

    // TODO: Validate token here?
}

export async function getSessionIssuer(): Promise<string> {
    const sessionId = (await cookies()).get('syk-inn-session-id')?.value ?? null

    if (sessionId == null) {
        raise('User without session ID trying to launch FHIR-session. Is middleware not middlewaring?')
    }

    const session = await (await getSessionStore()).get(sessionId)
    return session.iss
}
