import { logger } from '@navikt/next-logger'
import { createRemoteJWKSet, jwtVerify } from 'jose'

import { knownIssuers } from '../issuers'

import { getSession } from './session'

export async function ensureValidFhirAuth(): Promise<Response | 'ok'> {
    const session = await getSession()
    if (session == null) {
        return new Response('Unauthorized', { status: 401 })
    }

    logger.info(
        `Current users issuer: ${session.issuer}, looking for well known at ${session.issuer}/.well-known/smart-configuration`,
    )
    const wellKnown = await fetch(`${session.issuer}/.well-known/smart-configuration`).then((it) => it.json())
    logger.info(`Fetched well known configuration from session.issuer, jwks_uri: ${wellKnown['jwks_uri']}`)

    try {
        const verifyResult = await jwtVerify(session.accessToken, getJwkSet(wellKnown['jwks_uri']), {
            issuer: [session.issuer, ...knownIssuers[session.issuer].issuers],
            algorithms: ['RS256'],
        })

        logger.info(`Token verified!, ${JSON.stringify(verifyResult, null, 2)}`)

        return 'ok'
    } catch (e) {
        logger.error(new Error(`Token validation failed, ${(e as { code: string })?.code ?? 'UNKNOWN'}`))

        return new Response('Unauthorized', { status: 401 })
    }
}

const remoteJWKSetCache: Record<string, ReturnType<typeof createRemoteJWKSet>> = {}
function getJwkSet(jwksUri: string): ReturnType<typeof createRemoteJWKSet> {
    if (remoteJWKSetCache[jwksUri] == null) {
        remoteJWKSetCache[jwksUri] = createRemoteJWKSet(new URL(jwksUri))
    }

    return remoteJWKSetCache[jwksUri]
}
