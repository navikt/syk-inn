import { Hono } from 'hono'

import { GcpMockConfig } from './config'
import { storageRouter } from './storage/router'

export function createGcpMockApp(config: GcpMockConfig): Hono {
    const app = new Hono().basePath(config.gcpPath)

    app.route('/storage', storageRouter)

    app.notFound((c) => c.text(`Path ${c.req.path} is not a configured resource in the GCP mock server.`, 404))

    return app
}
