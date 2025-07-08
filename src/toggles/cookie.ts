import { cookies } from 'next/headers'

import { unleashLogger } from '@toggles/unleash'
import { UNLEASH_COOKIE_NAME } from '@toggles/const'

export async function getUnleashSessionId(): Promise<string> {
    const existingUnleashId = (await cookies()).get(UNLEASH_COOKIE_NAME)
    if (existingUnleashId != null) {
        return existingUnleashId.value
    } else {
        unleashLogger.warn('No existing unleash session id found, is middleware not configured?')
        return '0'
    }
}
