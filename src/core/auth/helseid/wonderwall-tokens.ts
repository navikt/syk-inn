import { logger } from '@navikt/next-logger'
import { headers } from 'next/headers'

/**
 * Wonderwall (see README.md) exchanges its own session ID for the actual HelseID access token. This
 * is not available in another contexts other than an RSC or route handler.
 */
export async function getWonderwallHelseIdAccessToken(): Promise<string | null> {
    const bearerToken = (await headers()).get('Authorization')
    if (!bearerToken) return null

    return bearerToken.replace('Bearer ', '')
}

export async function getWonderwallHelseIdDPoPToken(): Promise<{
    token: string
    proof: string
} | null> {
    const headersStore = await headers()

    const bearerToken = headersStore.get('Authorization')
    const dpopProof = headersStore.get('DPoP')

    if (!bearerToken || !dpopProof) return null

    if (!bearerToken.startsWith('DPoP')) {
        logger.error(
            `Found Authorization header, but it doesn't start with 'DPoP ', actually starts with: ${bearerToken.slice(0, 6)}`,
        )
        return null
    }

    return {
        token: bearerToken.replace('DPoP ', ''),
        proof: dpopProof,
    }
}

export async function getWonderwallHelseIdIdToken(): Promise<string> {
    const idToken = (await headers()).get('X-Wonderwall-Id-Token')
    if (!idToken) {
        throw new Error('No HelseID id_token was found')
    }

    return idToken
}
