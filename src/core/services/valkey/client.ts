import { logger } from '@navikt/next-logger'
import { GlideClient, GlideClientConfiguration } from '@valkey/valkey-glide'
import { lazyNextleton } from 'nextleton'

import { getServerEnv, ValkeyConfig } from '#lib/env'
import { raise } from '#lib/ts'

const DEFAULT_VALKEY_PORT = 6379

/**
 * Glide multiplexes every command over a single connection, so there should only ever be one client for the
 * entire application. The only exception is pub/sub subscriptions, which require their own connection.
 */
async function initializeValkey(): Promise<GlideClient> {
    const valkeyConfig = getServerEnv().valkey ?? raise('Valkey config is not set! :(')

    const client = await GlideClient.createClient(toGlideConfig(valkeyConfig))

    logger.info('Valkey client initialized')

    return client
}

export function toGlideConfig(config: ValkeyConfig): GlideClientConfiguration {
    const shared = {
        clientName: 'syk-inn',
        requestTimeout: 5000,
        advancedConfiguration: { connectionTimeout: 5000 },
    } satisfies Partial<GlideClientConfiguration>

    if ('tls' in config) {
        return {
            ...shared,
            addresses: [{ host: config.tls.host, port: config.tls.port }],
            useTLS: true,
            credentials: { username: config.username, password: config.password },
        }
    }

    /**
     * The local/test host is provided as a single string, which may or may not contain a port
     * (e.g. testcontainers gives us `localhost:32769`).
     */
    const [host, port] = config.host.split(':')

    return {
        ...shared,
        addresses: [{ host, port: port ? Number(port) : DEFAULT_VALKEY_PORT }],
    }
}

export const productionValkey = lazyNextleton('valkey-client', () => initializeValkey())
