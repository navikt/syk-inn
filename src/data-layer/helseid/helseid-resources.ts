import 'server-only'

import * as z from 'zod/v4'
import { headers } from 'next/headers'
import { logger } from '@navikt/next-logger'

import { getServerEnv, isE2E, isLocal, isDemo } from '@utils/env'
import { getLoopbackURL, pathWithBasePath } from '@utils/url'

type HelseIdWellKnown = z.infer<typeof HelseIdWellKnownSchema>
const HelseIdWellKnownSchema = z.object({
    issuer: z.string(),
    userinfo_endpoint: z.string(),
})

export async function getHelseIdWellKnown(): Promise<HelseIdWellKnown> {
    if (isLocal || isDemo || isE2E) {
        const parsedSchema = HelseIdWellKnownSchema.parse({
            issuer: `${getLoopbackURL()}${pathWithBasePath('/api/mocks/helseid')}`,
            userinfo_endpoint: `${getLoopbackURL()}${pathWithBasePath('/api/mocks/helseid/connect/userinfo')}`,
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

/**
 * Wonderwall (see README.md) exchanges it's own session ID for the actual HelseID access token. This
 * is not available in a other contexts other than a RSC or route handler.
 */
export async function getHelseIdAccessToken(): Promise<string> {
    if (isLocal || isDemo || isE2E) {
        return 'foo-bar-token'
    }

    const bearerToken = (await headers()).get('Authorization')

    if (!bearerToken) {
        throw new Error('No bearer token found')
    }

    return bearerToken.replace('Bearer ', '')
}
