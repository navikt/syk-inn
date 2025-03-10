import { z } from 'zod'

import { KeysOfUnion } from '@utils/ts'

export type BundledEnv = z.infer<typeof BundledEnvSchema>
const BundledEnvSchema = z.object({
    NEXT_PUBLIC_RUNTIME_ENV: z.union([
        z.literal('local'),
        z.literal('e2e'),
        z.literal('demo'),
        z.literal('prod-gcp'),
        z.literal('dev-gcp'),
    ]),
    NEXT_PUBLIC_BASE_PATH: z.string().nullish(),
    NEXT_PUBLIC_ASSET_PREFIX: z.string().nullish(),
})

/**
 * Next.js will bundle any environment variables that start with NEXT_PUBLIC_ into the
 * client bundle. These are available at any time, statically, in both server and browser.
 */
export const bundledEnv = BundledEnvSchema.parse({
    NEXT_PUBLIC_RUNTIME_ENV: process.env.NEXT_PUBLIC_RUNTIME_ENV,
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
    NEXT_PUBLIC_ASSET_PREFIX: process.env.NEXT_PUBLIC_ASSET_PREFIX,
})

type RedisConfig = z.infer<typeof RedisConfigSchema>
const RedisConfigSchema = z.union([
    /**
     * Defines a union type for strongly typing Redis configurations for local and production environments.
     * The local setup doesn't require authentication but does need the Docker image URL.
     */
    z.object({
        runtimeEnv: z.union([z.literal('dev-gcp'), z.literal('prod-gcp')]),
        url: z.string(),
        username: z.string(),
        password: z.string(),
    }),
    z.object({
        runtimeEnv: z.literal('local'),
        url: z.string(),
    }),
])

type ServerEnv = z.infer<typeof ServerEnvSchema>
const ServerEnvSchema = z.object({
    helseIdWellKnown: z.string(),
    redisConfig: RedisConfigSchema.nullish(),
})

/**
 * Pure server environment variables (i.e. not prefixed with NEXT_PUBLIC_) are only available
 * at runtime, and only on the server. Because these are strongly typed, they need to be accessed
 * lazily, otherwise the build would fail because of Next.js aggressive static optimizations.
 *
 * This can also be used in /api/internal/is_ready to verify that
 * the server is configured correctly before receiving any traffic.
 */
export function getServerEnv(): ServerEnv {
    const redisConfig =
        bundledEnv.NEXT_PUBLIC_RUNTIME_ENV !== 'demo' && bundledEnv.NEXT_PUBLIC_RUNTIME_ENV !== 'e2e'
            ? ({
                  runtimeEnv: process.env.NEXT_PUBLIC_RUNTIME_ENV,
                  url: process.env.REDIS_URI_SYK_INN,
                  username: process.env.REDIS_USERNAME_SYK_INN,
                  password: process.env.REDIS_PASSWORD_SYK_INN,
              } satisfies Record<KeysOfUnion<RedisConfig>, unknown | undefined>)
            : undefined

    return ServerEnvSchema.parse({
        redisConfig,
        helseIdWellKnown: process.env.HELSE_ID_WELL_KNOWN_URL,
    } satisfies Record<keyof ServerEnv, unknown | undefined>)
}

export const isLocalOrDemo = process.env.NODE_ENV === 'development' || bundledEnv.NEXT_PUBLIC_RUNTIME_ENV === 'demo'
export const isE2E = bundledEnv.NEXT_PUBLIC_RUNTIME_ENV === 'e2e'
