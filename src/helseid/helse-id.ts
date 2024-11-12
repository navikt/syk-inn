import { z } from 'zod'

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
