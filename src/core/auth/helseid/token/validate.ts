import { jwtVerify, errors } from 'jose'

import { failSpan, spanServerAsync } from '#lib/otel/server'

import { getJwkSet } from './jwk'
import { getHelseIdWellKnown } from './well-known'

export async function verifyHelseIdToken(token: string): Promise<boolean> {
    return spanServerAsync('HelseID.verify-token', async (span) => {
        try {
            const wellKnown = await getHelseIdWellKnown()
            const jwks = getJwkSet(wellKnown.jwks_uri)

            await jwtVerify(token, jwks, {
                issuer: wellKnown.issuer,
                algorithms: ['RS256'],
            })

            span.setAttributes({
                'HelseID.token.valid': true,
            })

            return true
        } catch (e) {
            const errorType = e instanceof errors.JOSEError ? e.code : 'UnknownError'

            failSpan(
                span,
                'HelseID-token validation failed',
                e instanceof Error ? e : new Error('Unknown error during token validation', { cause: e }),
            )

            span.setAttributes({
                'HelseID.token.valid': false,
                'HelseID.token.error-type': errorType,
            })

            return false
        }
    })
}
