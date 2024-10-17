import { createRemoteJWKSet, jwtVerify } from 'jose'
import { logger } from '@navikt/next-logger'

import { getSessionIssuer } from '../sessions/session-lifecycle'
import { knownIssuers } from '../issuers'

export async function verifyFhirToken(token: string): Promise<void> {
    const issuer = await getSessionIssuer()
    if (!knownIssuers.find((it) => it.startsWith(issuer))) {
        throw new Error(`Non-allow-listed issuer: ${issuer}. Somebody is hacking! :shock:`)
    }

    const wellKnown = await fetch(`${issuer}/.well-known/smart-configuration`).then((it) => it.json())
    const cleanToken = token.replace('Bearer ', '')

    try {
        const verifyResult = await jwtVerify(cleanToken, getJwkSet(wellKnown['jwks_uri']), {
            issuer: wellKnown['issuer'],
            audience: 'what',
            algorithms: ['RS256'],
        })

        logger.info(`Token verified!, ${JSON.stringify(verifyResult, null, 2)}`)
    } catch (e) {
        logger.error(new Error(`Token validation failed, ${(e as { code: string })?.code ?? 'UNKNOWN'}`, { cause: e }))
        throw e
    }
}

const remoteJWKSetCache: Record<string, ReturnType<typeof createRemoteJWKSet>> = {}
const getJwkSet = (jwksUri: string): ReturnType<typeof createRemoteJWKSet> => {
    if (remoteJWKSetCache[jwksUri] == null) {
        remoteJWKSetCache[jwksUri] = createRemoteJWKSet(new URL(jwksUri))
    }

    return remoteJWKSetCache[jwksUri]
}
