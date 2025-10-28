import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { HelseIdMockConfig } from './config'
import { metaRoutes } from './meta/router'

export function createHelseIdMockApp(config: HelseIdMockConfig): Hono {
    const app = new Hono().basePath(config.helseIdPath)

    app.use('*', cors())

    metaRoutes(app)

    app.notFound((c) => c.text(`Path ${c.req.path} is not a configured resource in the FHIR mock server.`, 404))

    return app
}
