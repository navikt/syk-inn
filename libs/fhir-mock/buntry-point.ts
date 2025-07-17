import { logger } from '@navikt/pino-logger'

import { createMockFhirApp } from './src/router'
import { FhirMockConfig, setConfig } from './src/config'

const port = process.env.PORT ?? 5000

const config: FhirMockConfig = {
    fhirPath: '',
    baseUrl: `http://localhost:${port}`,
    clients: [
        {
            clientId: 'syk-inn',
            method: 'client_secret_basic',
            clientSecret: 'dev-mode-client-secret',
        },
    ],
}

setConfig(config)

const app = createMockFhirApp(config)

// @ts-expect-error Just a bun script, no types
await Bun.serve({
    port,
    fetch: app.fetch,
    idleTimeout: 10,
})

logger.info(
    `FHIR Mock server running at ${config.baseUrl}${config.fhirPath}\n\tVisit well-known: ${config.baseUrl}${config.fhirPath}/.well-known/smart-configuration`,
)
