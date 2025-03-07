import { lazyNextleton } from 'nextleton'
import * as R from 'remeda'
import { createClient } from '@redis/client'
import { logger } from '@navikt/next-logger'

import { getServerEnv } from '@utils/env'
import { raise } from '@utils/ts'

export const redisClient = lazyNextleton('valkey', () => {
    const redisConfig = getServerEnv().redisConfig ?? raise('Redis config is not set! :(')

    const client = createClient({
        ...R.omit(redisConfig, ['runtimeEnv']),
        socket: {
            connectTimeout: 5000,
            keepAlive: 5000,
        },
        pingInterval: 10 * 1000,
    })

    client.on('error', (err) => logger.error(err))
    client.on('connect', () => logger.info('Redis Client Connected'))
    client.on('ready', () => logger.info('Redis Client Ready'))

    return client
})
