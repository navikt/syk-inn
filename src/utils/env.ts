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

type ValkeyConfig = z.infer<typeof ValkeyConfigSchema>
const ValkeyConfigSchema = z.union([
    /**
     * Defines a union type for strongly typing Valkey configurations for local and production environments.
     * The local setup doesn't require authentication but does need the Docker image URL.
     */
    z.object({
        runtimeEnv: z.union([z.literal('dev-gcp'), z.literal('prod-gcp')]),
        username: z.string(),
        password: z.string(),
        tls: z.object({
            host: z.string(),
            port: z.coerce.number(),
        }),
    }),
    z.object({
        runtimeEnv: z.literal('local'),
        host: z.string(),
    }),
])

type ServerEnv = z.infer<typeof ServerEnvSchema>
const ServerEnvSchema = z.object({
    helseIdWellKnown: z.string(),
    valkeyConfig: ValkeyConfigSchema.nullish(),
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
    const valkeyConfig =
        bundledEnv.NEXT_PUBLIC_RUNTIME_ENV !== 'demo' && bundledEnv.NEXT_PUBLIC_RUNTIME_ENV !== 'e2e'
            ? ({
                  runtimeEnv: process.env.NEXT_PUBLIC_RUNTIME_ENV,
                  username: process.env.VALKEY_USERNAME_SYK_INN,
                  password: process.env.VALKEY_PASSWORD_SYK_INN,
                  // Local
                  host: process.env.VALKEY_HOST_SYK_INN,
                  // Cloud
                  tls: {
                      host: process.env.VALKEY_HOST_SYK_INN,
                      port: process.env.VALKEY_PORT_SYK_INN,
                  },
              } satisfies Record<KeysOfUnion<ValkeyConfig>, unknown | undefined>)
            : undefined

    return ServerEnvSchema.parse({
        valkeyConfig: valkeyConfig,
        helseIdWellKnown: process.env.HELSE_ID_WELL_KNOWN_URL,
    } satisfies Record<keyof ServerEnv, unknown | undefined>)
}

export const isLocalOrDemo = process.env.NODE_ENV === 'development' || bundledEnv.NEXT_PUBLIC_RUNTIME_ENV === 'demo'
export const isE2E = bundledEnv.NEXT_PUBLIC_RUNTIME_ENV === 'e2e'
