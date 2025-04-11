import { Router, json } from 'itty-router'

import { fhirServerTestData } from './data/fhir-server'

export const metaRouter = Router({ path: '/*' })
    .get('/.well-known/smart-configuration', () => json(fhirServerTestData.wellKnown()))
    .get('/metadata', () => json(fhirServerTestData.metadata()))
    .get('/keys', async () => json(await fhirServerTestData.keys()))
