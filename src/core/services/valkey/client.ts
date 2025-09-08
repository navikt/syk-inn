import { lazyNextleton } from 'nextleton'
import Valkey from 'iovalkey'
import * as R from 'remeda'
import { logger } from '@navikt/next-logger'

import { getServerEnv } from '@lib/env'
import { raise } from '@lib/ts'

function initializeValkey(): Valkey {
    const valkeyConfig = getServerEnv().valkeyConfig ?? raise('Valkey config is not set! :(')

    const client = new Valkey({
        ...R.omit(valkeyConfig, ['runtimeEnv']),
        connectTimeout: 5000,
        enableReadyCheck: false,
    })

    client.on('error', (err: Error) => logger.error(err))

    return client
}

export const productionValkey = lazyNextleton('valkey-client', () => initializeValkey())
