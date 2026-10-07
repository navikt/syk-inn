import { handle } from '@hono/vercel'

import { GcpMockConfig } from './config'
import { createGcpMockApp } from './router'

export function createGcpHandler(config: GcpMockConfig): (req: Request) => Promise<Response> | Response {
    const app = createGcpMockApp(config)

    return handle(app)
}
