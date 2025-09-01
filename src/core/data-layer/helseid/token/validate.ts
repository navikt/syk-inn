import { jwtVerify } from 'jose'
import { logger } from '@navikt/next-logger'

import { getHelseIdWellKnown } from '@data-layer/helseid/token/well-known'
import { getJwkSet } from '@data-layer/helseid/token/jwk'
import { spanServerAsync } from '@lib/otel/server'
import { getHelseIdAccessToken } from '@data-layer/helseid/token/tokens'

export async function validateHelseIdToken(): Promise<boolean> {
    return spanServerAsync('HelseID.token-validation', async () => {
        const accessToken = await getHelseIdAccessToken()

        try {
            const wellKnown = await getHelseIdWellKnown()
            const jwks = getJwkSet(wellKnown.jwks_uri)

            await jwtVerify(accessToken, jwks, {
                issuer: wellKnown.issuer,
                algorithms: ['RS256'],
            })

            return true
        } catch (e) {
            logger.warn(new Error(`HelseID-token validation failed`, { cause: e }))
            return false
        }
    })
}
