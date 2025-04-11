import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { authRouter } from './auth/router'
import { documentReferenceRouter } from './resources/document-reference/router'
import { simpleResourcesRoutes } from './resources/simple-resources/router'
import { metaRoutes } from './meta/router'
import { conditionRouter } from './resources/condition/router'
import { FhirMockConfig } from './config'

export function createMockFhirApp(config: FhirMockConfig): Hono {
    const app = new Hono().basePath(config.fhirPath)

    app.use('*', cors())
    app.route('/auth', authRouter)
    app.route('/DocumentReference/', documentReferenceRouter)
    app.route('/Condition', conditionRouter)

    simpleResourcesRoutes(app)
    metaRoutes(app)

    app.notFound((c) => c.text(`Path ${c.req.path} is not a configured resource in the FHIR mock server.`))

    return app
}
