import { handle } from 'hono/vercel'

import { FhirMockConfig, setConfig } from './config'
import { createMockFhirApp } from './router'

/**
 * Creates a (req: Request) => Promise<Response> handler for the fhir mock server.
 *
 * Required, you need to inform the mock routes about paths and stuff
 * @param config
 */
export function createFhirHandler(config: FhirMockConfig): (req: Request) => Promise<Response> | Response {
    setConfig(config)

    const app = createMockFhirApp(config)

    return handle(app)
}

export { FhirMockSession } from './server-session'
