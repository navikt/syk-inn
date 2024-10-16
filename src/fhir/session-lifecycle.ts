import { cookies } from 'next/headers'

import { raise } from '@utils/ts'
import { sessionStore } from '@fhir/session-store'

export async function sessionLaunched(issuer: string): Promise<void> {
    const sessionId = cookies().get('syk-inn-session-id')?.value ?? null

    if (sessionId == null) {
        raise('User without session ID trying to launch FHIR-session. Is middleware not middlewaring?')
    }

    sessionStore.initSession(sessionId, issuer)
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function sessionAuthed(accessToken: string): Promise<void> {
    const sessionId = cookies().get('syk-inn-session-id')?.value ?? null

    if (sessionId == null) {
        raise('User without session ID trying to launch FHIR-session. Is middleware not middlewaring?')
    }

    if (!sessionStore.isSessionInitiated(sessionId)) {
        raise('User trying to authenticate without having launched a session, that is illegal.')
    }

    sessionStore.completeAuth(sessionId)

    // TODO: Validate token here?
}
