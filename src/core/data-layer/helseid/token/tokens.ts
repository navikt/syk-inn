import { headers } from 'next/headers'

/**
 * Wonderwall (see README.md) exchanges its own session ID for the actual HelseID access token. This
 * is not available in another contexts other than an RSC or route handler.
 */
export async function getHelseIdAccessToken(): Promise<string> {
    const bearerToken = (await headers()).get('Authorization')

    if (!bearerToken) {
        throw new Error('No HelseID access_token was found')
    }

    return bearerToken.replace('Bearer ', '')
}

export async function getHelseIdIdToken(): Promise<string> {
    const idToken = (await headers()).get('X-Wonderwall-Id-Token')
    if (!idToken) {
        throw new Error('No HelseID id_token was found')
    }

    return idToken
}
