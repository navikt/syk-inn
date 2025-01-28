import { createRemoteJWKSet, jwtVerify } from 'jose'
import { logger } from '@navikt/next-logger'

import { getSessionIssuer } from '../sessions/session-lifecycle'
import { isKnownFhirServer, knownIssuers } from '../issuers'

export async function verifyFhirToken(token: string): Promise<void> {
    const issuer = await getSessionIssuer()
    if (!isKnownFhirServer(issuer)) {
        throw new Error(`Non-allow-listed issuer: ${issuer}. Somebody is hacking! :shock:`)
    }

    logger.info(`Current users issuer: ${issuer}, looking for well known at ${issuer}/.well-known/smart-configuration`)
    const wellKnown = await fetch(`${issuer}/.well-known/smart-configuration`).then((it) => it.json())
    const cleanToken = token.replace('Bearer ', '')

    logger.info(`Fetched well known configuration from issuer, jwks_uri: ${wellKnown['jwks_uri']}`)

    try {
        const verifyResult = await jwtVerify(cleanToken, getJwkSet(wellKnown['jwks_uri']), {
            issuer: [issuer, ...knownIssuers[issuer].issuers],
            algorithms: ['RS256'],
        })

        logger.info(`Token verified!, ${JSON.stringify(verifyResult, null, 2)}`)
    } catch (e) {
        logger.error(new Error(`Token validation failed, ${(e as { code: string })?.code ?? 'UNKNOWN'}`))
        throw e
    }
}

const remoteJWKSetCache: Record<string, ReturnType<typeof createRemoteJWKSet>> = {}
function getJwkSet(jwksUri: string): ReturnType<typeof createRemoteJWKSet> {
    if (remoteJWKSetCache[jwksUri] == null) {
        remoteJWKSetCache[jwksUri] = createRemoteJWKSet(new URL(jwksUri))
    }

    return remoteJWKSetCache[jwksUri]
}
