import { jwtVerify, errors } from 'jose'
import { logger } from '@navikt/next-logger'

import { getHelseIdWellKnown } from '@data-layer/helseid/token/well-known'
import { getJwkSet } from '@data-layer/helseid/token/jwk'
import { spanServerAsync } from '@lib/otel/server'
import { getHelseIdAccessToken } from '@data-layer/helseid/token/tokens'

export async function validateHelseIdToken(): Promise<boolean> {
    return spanServerAsync('HelseID.token-validation', async (span) => {
        const accessToken = await getHelseIdAccessToken()

        try {
            const wellKnown = await getHelseIdWellKnown()
            const jwks = getJwkSet(wellKnown.jwks_uri)

            await jwtVerify(accessToken, jwks, {
                issuer: wellKnown.issuer,
                algorithms: ['RS256'],
            })

            span.setAttributes({
                'HelseID.token.valid': true,
            })

            return true
        } catch (e) {
            const errorType = e instanceof errors.JOSEError ? e.code : 'UnknownError'

            logger.warn(new Error(`HelseID-token validation failed`, { cause: e }))

            span.setAttributes({
                'HelseID.token.valid': true,
                'HelseID.token.error-type': errorType,
            })

            return false
        }
    })
}
