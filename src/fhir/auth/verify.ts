import { createRemoteJWKSet, jwtVerify } from 'jose'
import { logger } from '@navikt/next-logger'
import { cookies } from 'next/headers'

import { raise } from '@utils/ts'
import { sessionStore } from '@fhir/session-store'
import { knownIssuers } from '@fhir/issuers'

export async function verifyFhirToken(token: string): Promise<void> {
    const session = sessionStore.get(cookies().get('syk-inn-session-id')?.value ?? raise('No session ID found!'))
    const wellKnown = await fetch(`${session.iss}/.well-known/smart-configuration`).then((it) => it.json())

    if (!knownIssuers.find((it) => it.startsWith(session.iss))) {
        throw new Error(`Non-allow-listed issuer: ${session.iss}`)
    }

    if (!('accessToken' in session)) {
        raise('No valid session no authenticate')
    }

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
