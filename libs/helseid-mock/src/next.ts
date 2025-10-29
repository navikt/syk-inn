import { handle } from 'hono/vercel'

import { HelseIdMockConfig, setConfig } from './config'
import { createHelseIdMockApp } from './router'

/**
 * Creates a (req: Request) => Promise<Response> handler for the fhir mock server.
 *
 * Required, you need to inform the mock routes about paths and stuff
 * @param config
 */
export function createHelseIdHandler(config: HelseIdMockConfig): (req: Request) => Promise<Response> | Response {
    setConfig(config)

    const app = createHelseIdMockApp(config)

    return handle(app)
}

export { HelseIdMockSession } from './server-session'
export { MOCK_HELSEID_TOKEN_NAME } from './cookie'
