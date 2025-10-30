import * as z from 'zod'

import { getHelseIdUrl } from '@data-layer/helseid/config/envs'

type HelseIdWellKnown = z.infer<typeof HelseIdWellKnownSchema>
const HelseIdWellKnownSchema = z.object({
    issuer: z.string(),
    jwks_uri: z.url(),
    userinfo_endpoint: z.string(),
})

export async function getHelseIdWellKnown(): Promise<HelseIdWellKnown> {
    const response = await fetch(`${getHelseIdUrl()}/.well-known/openid-configuration`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    })

    if (!response.ok) {
        throw new Error(`Failed to fetch well known: ${response.statusText}`)
    }

    return HelseIdWellKnownSchema.parseAsync(await response.json())
}
