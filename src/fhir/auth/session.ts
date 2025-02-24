import { cookies } from 'next/headers'

import { getSessionStore, Session } from '../sessions/session-store'

export async function getSession(sessionId?: string): Promise<Session | null> {
    let session: string | null = sessionId ?? null
    if (sessionId == null) {
        const cookieStore = await cookies()
        session = cookieStore.get('syk-inn-session-id')?.value ?? null
    }

    if (session == null) {
        return null
    }

    const store = await getSessionStore()
    return await store.getSession(session)
}
