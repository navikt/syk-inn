import { Hono } from 'hono'

import { fhirServerTestData } from './data/fhir-server'

export function metaRoutes(app: Hono): void {
    app.get('/.well-known/smart-configuration', (c) => c.json(fhirServerTestData.wellKnown()))
    app.get('/metadata', (c) => c.json(fhirServerTestData.metadata()))
    app.get('/keys', async (c) => c.json(await fhirServerTestData.keys()))
}
