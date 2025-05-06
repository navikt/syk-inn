import { configureLogger, logger } from '@navikt/next-logger'

import { bundledEnv } from '@utils/env'

import { getFaro } from './faro/faro'

configureLogger({
    basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? undefined,
})

const faro = getFaro()

logger.info(`Faro initialized: ${faro == null ? 'no' : 'yes'} (${bundledEnv.NEXT_PUBLIC_TELEMETRY_URL})`)
