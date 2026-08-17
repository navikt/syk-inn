import * as R from 'remeda'
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
        const openidConfigurationEndpoint = `${getHelseIdUrl()}/.well-known/openid-configuration`

        span.setAttributes({
            'HelseID.well-known.endpoint': openidConfigurationEndpoint,
        })

        const response = await fetch(openidConfigurationEndpoint, {
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

        span.setAttributes(R.mapKeys(parsed.data, (value, key) => `HelseID.well-known.${key}`))

        return parsed.data
    })
}
