import * as z from 'zod'
import { logger } from '@navikt/next-logger'

import { getServerEnv, isDemo, isE2E, isLocal } from '@lib/env'
import { getLoopbackURL, pathWithBasePath } from '@lib/url'

type HelseIdWellKnown = z.infer<typeof HelseIdWellKnownSchema>
const HelseIdWellKnownSchema = z.object({
    issuer: z.string(),
    jwks_uri: z.url(),
    userinfo_endpoint: z.string(),
})

export async function getHelseIdWellKnown(): Promise<HelseIdWellKnown> {
    if (isLocal || isDemo || isE2E) {
        const parsedSchema = HelseIdWellKnownSchema.parse({
            issuer: `${getLoopbackURL()}${pathWithBasePath('/api/mocks/helseid')}`,
            userinfo_endpoint: `${getLoopbackURL()}${pathWithBasePath('/api/mocks/helseid/connect/userinfo')}`,
            jwks_uri: `${getLoopbackURL()}${pathWithBasePath('/api/mocks/helseid/.well-known/jwks.json')}`,
        } satisfies HelseIdWellKnown)

        logger.info(`Fake local or demo HelseID .well-known: ${JSON.stringify(parsedSchema, null, 2)}`)

        return parsedSchema
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
