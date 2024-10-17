import { z } from 'zod'

const BundledEnvSchema = z.object({
    NEXT_PUBLIC_RUNTIME_ENV: z.union([
        z.literal('local'),
        z.literal('demo'),
        z.literal('prod-gcp'),
        z.literal('dev-gcp'),
    ]),
    NEXT_PUBLIC_BASE_PATH: z.string().nullish(),
    NEXT_PUBLIC_ASSET_PREFIX: z.string().nullish(),
})

export const bundledEnv = BundledEnvSchema.parse({
    NEXT_PUBLIC_RUNTIME_ENV: process.env.NEXT_PUBLIC_RUNTIME_ENV,
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
    NEXT_PUBLIC_ASSET_PREFIX: process.env.NEXT_PUBLIC_ASSET_PREFIX,
})

type ServerEnv = z.infer<typeof ServerEnvSchema>
const ServerEnvSchema = z.object({
    REDIS_URL: z.string().nullish(),
})

export function getServerEnv(): ServerEnv {
    return ServerEnvSchema.parse({
        REDIS_URL: process.env.REDIS_URL,
    } satisfies Record<keyof ServerEnv, string | undefined>)
}

export const isLocalOrDemo = process.env.NODE_ENV === 'development' || bundledEnv.NEXT_PUBLIC_RUNTIME_ENV === 'demo'
