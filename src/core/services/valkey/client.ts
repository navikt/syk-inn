import { logger } from '@navikt/next-logger'
import { GlideClient } from '@valkey/valkey-glide'
import { lazyNextleton } from 'nextleton'

import { getServerEnv } from '#lib/env'
import { raise } from '#lib/ts'

async function initializeValkey(): Promise<GlideClient> {
    const valkeyConfig = getServerEnv().valkey ?? raise('Valkey config is not set! :(')

    const client = await GlideClient.createClient({
        clientName: 'syk-inn',
        addresses: [{ host: valkeyConfig.host, port: valkeyConfig.port }],
        credentials: valkeyConfig.password
            ? { username: valkeyConfig.username, password: valkeyConfig.password }
            : undefined,
        useTLS: valkeyConfig.tls,
    })

    logger.info('Valkey client initialized')

    return client
}

export const realValkey = lazyNextleton('valkey-client', () => initializeValkey())
