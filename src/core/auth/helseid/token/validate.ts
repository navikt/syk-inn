import { jwtVerify, errors, decodeProtectedHeader, importJWK } from 'jose'

import { failSpan, spanServerAsync } from '#lib/otel/server'

import { getJwkSet } from './jwk'
import { getHelseIdWellKnown } from './well-known'

/**
 * Validates the DPoP-token according to some of the requirements from HelseID as described here:
 *
 * https://utviklerportal.nhn.no/informasjonstjenester/helseid/protokoller-og-sikkerhetsprofil/sikkerhetsprofil/docs/vedlegg/validering_av_dpop-bevis_no_nbmd
 *
 * Wonderwall handles a lot of the complexity, but as the app we are responsible for validating the claims.
 */
export async function verifyHelseIdDPoPToken(token: string, proof: string): Promise<boolean> {
    return spanServerAsync('HelseID.verify-dpop-token', async (span) => {
        try {
            const wellKnown = await getHelseIdWellKnown()
            const jwks = getJwkSet(wellKnown.jwks_uri)

            await jwtVerify(token, jwks, {
                issuer: wellKnown.issuer,
                algorithms: ['RS256'],
                requiredClaims: ['cnf'],
            })

            const proofHeader = decodeProtectedHeader(proof)
            if (proofHeader.jwk == null || proofHeader.jwk.kty === 'oct') {
                span.setAttributes({
                    'HelseID.token.valid': false,
                    'HelseId.token.cause': 'invalid proof header: missing or symmetric jwk',
                })
                return false
            }

            try {
                const publicKey = await importJWK(proofHeader.jwk, proofHeader.alg)
                await jwtVerify(proof, publicKey)
            } catch (e) {
                failSpan(span, 'HelseID DPoP proof signature validation', e instanceof Error ? e : undefined)
                span.setAttributes({
                    'HelseID.token.valid': false,
                    'HelseId.token.cause': 'invalid proof signature',
                })
                return false
            }

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
