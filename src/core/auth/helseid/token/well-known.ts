import QuickLRU from 'quick-lru'
import * as R from 'remeda'
import * as z from 'zod'

import { getServerEnv } from '#lib/env'
import { failSpan, spanServerAsync } from '#lib/otel/server'

const wellKnownCache = new QuickLRU<string, HelseIdWellKnown>({
    maxSize: 50,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
})

export type HelseIdWellKnown = z.infer<typeof HelseIdWellKnownSchema>
const HelseIdWellKnownSchema = z.object({
    issuer: z.string(),
    jwks_uri: z.url(),
    userinfo_endpoint: z.string(),
})

export async function getHelseIdWellKnown(): Promise<HelseIdWellKnown> {
    return spanServerAsync('HelseID.get-well-known', async (span) => {
        const cached = wellKnownCache.get('well-known')
        if (cached) {
            span.setAttribute('HelseID.well-known.cached', true)
            span.setAttribute('HelseID.well-known.cached.ttl', `${wellKnownCache.expiresIn('well-known')}ms`)
            return cached
        }

        const openidConfigurationEndpoint = `${getServerEnv().helseid.url}/.well-known/openid-configuration`

        span.setAttributes({
            'HelseID.well-known.cached': false,
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

        wellKnownCache.set('well-known', parsed.data)
        return parsed.data
    })
}
