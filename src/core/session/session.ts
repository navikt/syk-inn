import { cookies } from 'next/headers'

import { HAS_REQUESTED_ACCESS_COOKIE_NAME, SESSION_COOKIE_NAME } from '@core/session/cookies'

export async function getSessionId(): Promise<string | null> {
    const cookieStore = await cookies()

    return cookieStore.get(SESSION_COOKIE_NAME)?.value ?? null
}

export async function getHasRequestedAccessToSykmeldinger(practitionerId: string, patientId: string): Promise<boolean> {
    const cookieStore = await cookies()

    const hasRequestedAccess = cookieStore.get(
        `${HAS_REQUESTED_ACCESS_COOKIE_NAME}_${practitionerId}_${patientId}`,
    )?.value
    return hasRequestedAccess === 'true'
}
