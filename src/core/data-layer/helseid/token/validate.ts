import { jwtVerify, errors } from 'jose'
import { logger } from '@navikt/next-logger'

import { spanServerAsync } from '@lib/otel/server'

import { getHelseIdWellKnown } from './well-known'
import { getJwkSet } from './jwk'
import { getHelseIdAccessToken } from './tokens'

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
