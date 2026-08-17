import * as z from 'zod'

import { failSpan, spanServerAsync } from '#lib/otel/server'

import { getHelseIdUrl } from '../config/envs'

type HelseIdWellKnown = z.infer<typeof HelseIdWellKnownSchema>
const HelseIdWellKnownSchema = z.object({
    issuer: z.string(),
    jwks_uri: z.url(),
    userinfo_endpoint: z.string(),
})

export async function getHelseIdWellKnown(): Promise<HelseIdWellKnown> {
    return spanServerAsync('HelseID.get-well-known', async (span) => {
        const response = await fetch(`${getHelseIdUrl()}/.well-known/openid-configuration`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        })

        if (!response.ok) {
            failSpan.andThrow(
                span,
                'HelseID well-known fetch failed',
                new Error(`HelseID well-known fetch failed with status ${response.status} ${response.statusText}`),
            )
        }

        const parsed = HelseIdWellKnownSchema.safeParse(await response.json())

        if (!parsed.success) {
            failSpan.andThrow(
                span,
                'HelseID well-known parse failed',
                new Error(`HelseID well-known parse failed`, { cause: parsed.error }),
            )
        }

        return parsed.data
    })
}
