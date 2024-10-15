import { createRemoteJWKSet, jwtVerify } from 'jose'
import { logger } from '@navikt/next-logger'

export async function verifyFhirToken(token: string): Promise<void> {
    try {
        const verifyResult = await jwtVerify(
            token.replace('Bearer ', ''),
            getJwkSet('http://localhost:3000/api/fhir-mock/keys'),
            {
                issuer: 'http://localhost:3000/api/fhir-mock/fhir',
                audience: 'what',
                algorithms: ['RS256'],
            },
        )

        logger.info(`Token verified!, ${JSON.stringify(verifyResult, null, 2)}`)
    } catch (e) {
        logger.error(new Error(`Token validation failed, ${(e as { code: string })?.code ?? 'UNKNOWN'}`, { cause: e }))
    }
}

const remoteJWKSetCache: Record<string, ReturnType<typeof createRemoteJWKSet>> = {}
const getJwkSet = (jwksUri: string): ReturnType<typeof createRemoteJWKSet> => {
    if (!remoteJWKSetCache[jwksUri]) {
        remoteJWKSetCache[jwksUri] = createRemoteJWKSet(new URL(jwksUri))
    }

    return remoteJWKSetCache[jwksUri]
}
