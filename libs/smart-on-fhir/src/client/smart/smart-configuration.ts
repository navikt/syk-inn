import { createRemoteJWKSet } from 'jose'

import { logger } from '../logger'
import { SmartConfiguration, SmartConfigurationSchema } from '../schema/SmartConfiguration'

export type SmartConfigurationErrors = {
    error: 'WELL_KNOWN_INVALID_BODY' | 'WELL_KNOWN_INVALID_RESPONSE' | 'UNKNOWN_ERROR'
}

export async function fetchSmartConfiguration(issuer: string): Promise<SmartConfiguration | SmartConfigurationErrors> {
    issuer = removeTrailingSlash(issuer)

    const smartConfigurationUrl = `${issuer}/.well-known/smart-configuration`
    logger.info(`Fetching smart-configuration from ${smartConfigurationUrl}`)

    try {
        const response = await fetch(smartConfigurationUrl)
        if (!response.ok) {
            logger.error(`Issuer responded with ${response.status} ${response.statusText}`)
            return { error: 'WELL_KNOWN_INVALID_RESPONSE' }
        }

        const result: unknown = await response.json()
        const validatedWellKnown = SmartConfigurationSchema.safeParse(result)
        if (!validatedWellKnown.success) {
            logger.error(`Issuer ${issuer} responded with weird smart-configuration`, {
                cause: validatedWellKnown.error,
            })

            return { error: 'WELL_KNOWN_INVALID_BODY' }
        }

        logger.info(`Issuer ${issuer} validated, creating secure session`)

        return validatedWellKnown.data
    } catch (e) {
        logger.error('Fatal error fetching smart configuration', { cause: e })
        return { error: 'UNKNOWN_ERROR' }
    }
}

function removeTrailingSlash(url: string): string {
    return url.replace(/\/$/, '')
}

const remoteJWKSetCache: Record<string, ReturnType<typeof createRemoteJWKSet>> = {}
export function getJwkSet(jwksUri: string): ReturnType<typeof createRemoteJWKSet> {
    if (remoteJWKSetCache[jwksUri] == null) {
        remoteJWKSetCache[jwksUri] = createRemoteJWKSet(new URL(jwksUri))
    }

    return remoteJWKSetCache[jwksUri]
}
