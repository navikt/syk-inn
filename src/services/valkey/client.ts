import { lazyNextleton } from 'nextleton'
import Valkey from 'iovalkey'
import * as R from 'remeda'
import { logger } from '@navikt/next-logger'

import { getServerEnv } from '@utils/env'
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

export const productionValkey = lazyNextleton('valkey-client', () => initializeValkey())
