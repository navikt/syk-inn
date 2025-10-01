import { Hono } from 'hono'
import { cors } from 'hono/cors'

import { authRouter } from './auth/router'
import { documentReferenceRouter } from './resources/document-reference/router'
import { metaRoutes } from './meta/router'
import { conditionRouter } from './resources/condition/router'
import { FhirMockConfig } from './config'
import { organizationRouter } from './resources/organization/router'
import { patientRouter } from './resources/patient/router'
import { practitionerRouter } from './resources/practitioner/router'
import { encounterRouter } from './resources/encounter/router'
import { debugRouter } from './debug'

export { setConfig, type FhirMockConfig } from './config'

export function createMockFhirApp(config: FhirMockConfig): Hono {
    const app = new Hono().basePath(config.fhirPath)

    app.use('*', cors())

    metaRoutes(app)

    app.route('/auth', authRouter)
    app.route('/DocumentReference', documentReferenceRouter)
    app.route('/Condition', conditionRouter)
    app.route('/Organization', organizationRouter)
    app.route('/Patient', patientRouter)
    app.route('/Practitioner', practitionerRouter)
    app.route('/Encounter', encounterRouter)
    app.route('/debug', debugRouter)

    app.notFound((c) => c.text(`Path ${c.req.path} is not a configured resource in the FHIR mock server.`, 404))

    return app
}
