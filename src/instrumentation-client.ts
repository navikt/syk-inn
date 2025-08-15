import { configureLogger, logger } from '@navikt/next-logger'

import { getFaro } from '@lib/otel/faro'
import { bundledEnv } from '@lib/env'

configureLogger({
    basePath: process.env.NEXT_PUBLIC_BASE_PATH ?? undefined,
})

const faro = getFaro()

logger.info(
    `Faro initialized: ${faro == null ? 'no' : 'yes'} (${bundledEnv.NEXT_PUBLIC_TELEMETRY_URL || 'null or empty string'})`,
)
