import { cookies } from 'next/headers'

import { UNLEASH_COOKIE_NAME } from './const'
import { unleashLogger } from './unleash'

export async function getUnleashSessionId(): Promise<string> {
    const existingUnleashId = (await cookies()).get(UNLEASH_COOKIE_NAME)
    if (existingUnleashId != null) {
        return existingUnleashId.value
    } else {
        unleashLogger.warn('No existing unleash session id found, is middleware not configured?')
        return '0'
    }
}
