import 'server-only'

import { z } from 'zod'
import { headers } from 'next/headers'

import { getServerEnv, isLocalOrDemo } from '@utils/env'

type HelseIdWellKnown = z.infer<typeof HelseIdWellKnownSchema>
const HelseIdWellKnownSchema = z.object({
    issuer: z.string(),
    userinfo_endpoint: z.string(),
})

export async function getHelseIdWellKnown(): Promise<HelseIdWellKnown> {
    if (isLocalOrDemo) {
        return HelseIdWellKnownSchema.parse({
            issuer: 'http://localhost:3000/api/mocks/helseid',
            userinfo_endpoint: 'http://localhost:3000/api/mocks/helseid/connect/userinfo',
        } satisfies HelseIdWellKnown)
    }

    const response = await fetch(getServerEnv().helseIdWellKnown, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        // Cache well known for 1 hour using nextjs
        next: { revalidate: 3600 },
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch well known: ${response.statusText}`)
    }

    return HelseIdWellKnownSchema.parseAsync(await response.json())
}

/**
 * Wonderwall (see README.md) exchanges it's own session ID for the actual HelseID access token. This
 * is not available in a other contexts other than a RSC or route handler.
 */
export async function getHelseIdAccessToken(): Promise<string> {
    if (isLocalOrDemo) {
        return 'foo-bar-token'
    }

    const bearerToken = (await headers()).get('Authorization')

    if (!bearerToken) {
        throw new Error('No bearer token found')
    }

    return bearerToken.replace('Bearer ', '')
}
