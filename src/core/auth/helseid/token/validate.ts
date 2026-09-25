import { jwtVerify, errors, decodeProtectedHeader } from 'jose'

import { failSpan, spanServerAsync } from '#lib/otel/server'

import { iatAgeInSeconds, verifyProofJwt } from './dpop'
import { getJwkSet } from './jwk'
import { getHelseIdWellKnown } from './well-known'

/**
 * Validates the DPoP-token according to some of the requirements from HelseID as described here:
 *
 * https://utviklerportal.nhn.no/informasjonstjenester/helseid/protokoller-og-sikkerhetsprofil/sikkerhetsprofil/docs/vedlegg/validering_av_dpop-bevis_no_nbmd
 *
 * Wonderwall handles a lot of the complexity, but as the app we are responsible for
 * validating the claims.
 *
 * Maybe we should do more here? Maybe not. Maybe jose should handle most of this? There not much
 * about DPoP on the jose Github repo, mostly this: https://github.com/panva/jose/discussions/99
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

            const proofPayload = await verifyProofJwt(proof, proofHeader.jwk, proofHeader.alg)
            if (proofPayload === false) {
                failSpan(span, 'HelseID DPoP proof validation failed')
                return false
            }

            if (iatAgeInSeconds(proofPayload.iat) > 10) {
                span.setAttributes({
                    'HelseID.token.valid': false,
                    'HelseId.token.cause': 'proof iat is too old',
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
