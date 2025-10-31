import { cookies } from 'next/headers'

import { SESSION_COOKIE_NAME } from '@core/session/cookies'

export async function getSessionId(): Promise<string | null> {
    const cookieStore = await cookies()

    return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null
}
