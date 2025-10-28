import { logger } from '@navikt/pino-logger'

import { HelseIdMockConfig, setConfig } from './src/config'
import { createHelseIdMockApp } from './src/router'

const port = process.env.PORT ?? 5000

const config: HelseIdMockConfig = {
    helseIdPath: '',
    baseUrl: `http://localhost:${port}`,
}

setConfig(config)

const app = createHelseIdMockApp(config)

// @ts-expect-error Just a bun script, no types
await Bun.serve({
    port,
    fetch: app.fetch,
    idleTimeout: 10,
})

logger.info(
    `HelseID Mock server running at ${config.baseUrl}${config.helseIdPath}\n\tVisit well-known: ${config.baseUrl}/.well-known/openid-configuration`,
)
