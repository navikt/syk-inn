import * as z from 'zod'

import { KeysOfUnion, raise } from './ts'

export type BundledEnv = z.infer<typeof BundledEnvSchema>
const BundledEnvSchema = z.object({
    runtimeEnv: z.union([
        z.literal('local'),
        z.literal('e2e'),
        z.literal('demo'),
        z.literal('prod-gcp'),
        z.literal('dev-gcp'),
    ]),
    NEXT_PUBLIC_BASE_PATH: z.string().nullish(),
    NEXT_PUBLIC_ASSET_PREFIX: z.string().nullish(),
    NEXT_PUBLIC_TELEMETRY_URL: z.string().nullish(),
    NEXT_PUBLIC_VERSION: z.string().nullish(),
    NEXT_PUBLIC_BUILD_TIME: z.string().nullish(),
})

/**
 * Next.js will bundle any environment variables that start with NEXT_PUBLIC_ into the
 * client bundle. These are available at any time, statically, in both server and browser.
 */
export const bundledEnv = BundledEnvSchema.parse({
    runtimeEnv: process.env.NEXT_PUBLIC_RUNTIME_ENV,
    NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
    NEXT_PUBLIC_ASSET_PREFIX: process.env.NEXT_PUBLIC_ASSET_PREFIX,
    NEXT_PUBLIC_TELEMETRY_URL: process.env.NEXT_PUBLIC_TELEMETRY_URL,
    NEXT_PUBLIC_VERSION: process.env.NEXT_PUBLIC_VERSION,
    NEXT_PUBLIC_BUILD_TIME: process.env.NEXT_PUBLIC_BUILD_TIME,
} satisfies Record<keyof BundledEnv, unknown>)

type ValkeyConfig = z.infer<typeof ValkeyConfigSchema>
const ValkeyConfigSchema = z.object({
    username: z.string().optional(),
    password: z.string().optional(),
    host: z.string(),
    port: z.coerce.number(),
    tls: z.boolean(),
})
const HelseIdConfigSchema = z.object({
    url: z.url(),
})

const FhirConfigSchema = z.object({
    publicJwk: z.string(),
    privateJwk: z.string(),
})

type ServerEnv = z.infer<typeof ServerEnvSchema>
const ServerEnvSchema = z.object({
    fhir: FhirConfigSchema,
    helseid: HelseIdConfigSchema,
    valkey: ValkeyConfigSchema.nullish(),
    useLocalSykInnApi: z.boolean().default(false),
    localSykInnApiHost: z.string().default('localhost:8080'),
    useLocalValkey: z.boolean().default(false),
    pilotFeedbackSlackWebhook: z.string().nullish(),
    openDemoMsFormsUrl: z.string().nullish(),
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
        bundledEnv.runtimeEnv !== 'demo' && bundledEnv.runtimeEnv !== 'e2e'
            ? ({
                  username: process.env.VALKEY_USERNAME_SYK_INN,
                  password: process.env.VALKEY_PASSWORD_SYK_INN,
                  host: process.env.VALKEY_HOST_SYK_INN,
                  port: process.env.VALKEY_PORT_SYK_INN,
                  // If VALKEY_URI_SYK_INN is set, it means we're in nais cloud
                  tls: process.env.VALKEY_URI_SYK_INN != null,
              } satisfies Record<KeysOfUnion<ValkeyConfig>, unknown>)
            : undefined

    const parsedEnv = ServerEnvSchema.parse({
        valkey: valkeyConfig,
        fhir: {
            publicJwk: process.env.SYK_INN_PUBLIC_KEY_JWK,
            privateJwk: process.env.SYK_INN_PRIVATE_KEY_JWK,
        },
        helseid: { url: process.env.HELSEID_URL },
        useLocalSykInnApi: process.env.USE_LOCAL_SYK_INN_API === 'true',
        localSykInnApiHost: process.env.LOCAL_SYK_INN_API_HOST,
        useLocalValkey: process.env.USE_LOCAL_VALKEY === 'true',
        pilotFeedbackSlackWebhook: process.env.PILOT_FEEDBACK_SLACK_WEBHOOK,
        openDemoMsFormsUrl: process.env.DEMO_MS_FORMS_URL,
    } satisfies Record<keyof ServerEnv, unknown>)

    if (bundledEnv.runtimeEnv !== 'local' && parsedEnv.useLocalSykInnApi) {
        raise('USE_LOCAL_SYK_INN_API should only be set to true in local environment')
    }

    return parsedEnv
}

export const isE2E = bundledEnv.runtimeEnv === 'e2e'
export const isDemo = bundledEnv.runtimeEnv === 'demo'
export const isLocal = bundledEnv.runtimeEnv === 'local'
export const isDevGcp = bundledEnv.runtimeEnv === 'dev-gcp'
export const isCloud = bundledEnv.runtimeEnv === 'dev-gcp' || bundledEnv.runtimeEnv === 'prod-gcp'
