import { cookies } from 'next/headers'

import { raise } from '@utils/ts'
import { getSessionStore } from '@fhir/sessions/session-store'

export async function sessionLaunched(issuer: string): Promise<void> {
    const sessionCookie = cookies().get('syk-inn-session-id')
    const sessionId = sessionCookie?.value ?? null

    if (sessionId == null) {
        raise('User without session ID trying to launch FHIR-session. Is middleware not middlewaring?')
    }

    const sessionStore = await getSessionStore()
    await sessionStore.initSession(sessionId, issuer)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sessionAuthed(accessToken: string): Promise<void> {
    const sessionId = cookies().get('syk-inn-session-id')?.value ?? null

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
    const sessionId = cookies().get('syk-inn-session-id')?.value ?? null

    if (sessionId == null) {
        raise('User without session ID trying to launch FHIR-session. Is middleware not middlewaring?')
    }

    const session = await (await getSessionStore()).get(sessionId)
    return session.iss
}
