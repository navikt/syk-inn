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
        enableReadyCheck: false,
    })

    client.on('error', (err: Error) => logger.error(err))
    client.on('connect', () => logger.info('Valkey Client Connected'))
    client.on('ready', () => logger.info('Valkey Client Ready'))

    return client
}

export function createInMemoryValkey(): Valkey {
    const store = new Map<string, Record<string, unknown>>()
    const indexes = new Map<string, Set<string>>()

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
                case 'set':
                    return async (key: string, value: Record<string, unknown>) => {
                        store.set(key, value)
                    }
                case 'sadd':
                    return async (key: string, value: string) => {
                        if (!indexes.has(key)) {
                            indexes.set(key, new Set())
                        }
                        const index = indexes.get(key)!
                        index.add(value)
                        store.set(key, { values: Array.from(index) })
                    }
                case 'srem':
                    return async (key: string, value: string) => {
                        const index = indexes.get(key)
                        if (!index) return 0

                        if (index.has(value)) {
                            index.delete(value)
                            store.set(key, { values: Array.from(index) })
                            return 1
                        }
                        return 0
                    }
                case 'sismember':
                    return async (key: string, value: string) => {
                        const index = indexes.get(key)
                        if (!index) return 0

                        return index.has(value) ? 1 : 0
                    }
                case 'smembers':
                    return async (key: string) => {
                        const index = indexes.get(key)
                        return index ? Array.from(index) : []
                    }
                case 'hgetall':
                    return async (key: string) => store.get(key) ?? null
                case 'exists':
                    return async (key: string) => {
                        return store.has(key) ? 1 : 0
                    }
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

export const getValkeyClient = lazyNextleton('valkey-client', () => {
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
