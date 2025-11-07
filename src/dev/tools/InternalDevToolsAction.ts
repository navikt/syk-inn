'use server'

import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'

import { HAS_REQUESTED_ACCESS_COOKIE_NAME } from '@core/session/cookies'

export async function togglesChangedAction(): Promise<void> {
    revalidatePath('/fhir')
}

export async function deleteRequestAccessCookie(): Promise<void> {
    const cookieStore = await cookies()

    const requestCookies = cookieStore.getAll().filter((it) => it.name.startsWith(HAS_REQUESTED_ACCESS_COOKIE_NAME))

    for (const cookie of requestCookies) {
        cookieStore.delete(cookie.name)
    }

    revalidatePath('/fhir')
}
