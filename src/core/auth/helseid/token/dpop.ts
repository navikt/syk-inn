import { importJWK, JWTPayload, jwtVerify, ProtectedHeaderParameters } from 'jose'

import { failSpan, spanServerAsync } from '#lib/otel/server'

export async function verifyProofJwt(
    proof: string,
    jwk: NonNullable<ProtectedHeaderParameters['jwk']>,
    alg: string | undefined,
): Promise<JWTPayload | false> {
    return spanServerAsync('HelseID.verify-proof-jwt', async (span) => {
        try {
            const publicKey = await importJWK(jwk, alg)
            const verifyResult = await jwtVerify(proof, publicKey)

            return verifyResult.payload
        } catch (e) {
            failSpan(span, 'HelseID DPoP proof signature validation', e instanceof Error ? e : undefined)
            span.setAttributes({
                'HelseID.token.valid': false,
                'HelseId.token.cause': 'invalid proof signature',
            })
            return false
        }
    })
}

export function iatAgeInSeconds(iat: number | undefined): number {
    return Date.now() / 1000 - (iat ?? 0)
}
