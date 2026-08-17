import { jwtVerify, errors } from 'jose'

import { failSpan, spanServerAsync } from '#lib/otel/server'

import { getJwkSet } from './jwk'
import { getHelseIdAccessToken } from './tokens'
import { getHelseIdWellKnown } from './well-known'

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
            // TODO: Temporary, just log the raw error:
            // oxlint-disable-next-line no-console
            console.error(e)

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
