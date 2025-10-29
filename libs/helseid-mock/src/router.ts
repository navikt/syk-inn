import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { HelseIdMockConfig } from './config'
import { metaRoutes } from './meta/router'
import { connectRouter } from './user/router'
import { devRouter } from './dev/router'
import { debugRouter } from './debug'

export function createHelseIdMockApp(config: HelseIdMockConfig): Hono {
    const app = new Hono().basePath(config.helseIdPath)

    app.use('*', cors())

    metaRoutes(app)
    app.route('/connect', connectRouter)
    app.route('/dev', devRouter)
    app.route('/debug', debugRouter)

    app.notFound((c) => c.text(`Path ${c.req.path} is not a configured resource in the HelseID mock server.`, 404))

    return app
}
