import { lazyNextleton } from 'nextleton'
import Valkey from 'iovalkey'
import * as R from 'remeda'
import { logger } from '@navikt/next-logger'

import { bundledEnv, getServerEnv } from '@utils/env'
import { raise } from '@utils/ts'

function initializeValkey(): Valkey {
    const valkeyConfig = getServerEnv().valkeyConfig ?? raise('Valkey config is not set! :(')

    const client = new Valkey({
        ...R.omit(valkeyConfig, ['runtimeEnv']),
        connectTimeout: 5000,
        keepAlive: 5000,
    })

    client.on('error', (err: Error) => logger.error(err))
    client.on('connect', () => logger.info('Valkey Client Connected'))
    client.on('ready', () => logger.info('Valkey Client Ready'))

    return client
}

function createInMemoryValkey(): Valkey {
    const store = new Map<string, Record<string, unknown>>()

    return new Proxy<Valkey>({} as Valkey, {
        get(target, prop: string) {
            if (prop === 'then') return target

            switch (prop) {
                case 'hset':
                    return async (key: string, values: Record<string, unknown>) => {
                        const existingValue = store.get(key) ?? {}
                        store.set(key, {
                            ...existingValue,
                            ...values,
                        })
                    }
                case 'hgetall':
                    return async (key: string) => store.get(key) ?? null
                case 'del':
                    return async (key: string) => store.delete(key)
                case 'expire':
                    return async () => {
                        // Dumb in memory map doesn't support expiration, use node-cache or... its fine
                        return true
                    }
                default:
                    return () => {
                        throw new Error(`Method ${prop} not implemented in in-memory valkey`)
                    }
            }
        },
    })
}

export const getValkeyClient = lazyNextleton('valkey-client', async () => {
    switch (bundledEnv.NEXT_PUBLIC_RUNTIME_ENV) {
        case 'e2e':
        case 'demo':
            return createInMemoryValkey()
        case 'local':
        case 'prod-gcp':
        case 'dev-gcp':
            return initializeValkey()
    }
})
