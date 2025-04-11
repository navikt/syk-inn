import { AutoRouter, error } from 'itty-router'

import { authRouter } from './auth/router'
import { documentReferenceRouter } from './resources/document-reference/router'
import { simpleResourceRouter } from './resources/simple-resources/router'
import { metaRouter } from './meta/router'
import { conditionRouter } from './resources/condition/router'

export const router = AutoRouter({})
    .get('/api/mocks/fhir/.well-known/smart-configuration')
    .all('/auth/*', authRouter.fetch)
    .all('/DocumentReference', documentReferenceRouter.fetch)
    .all('/Condition', conditionRouter.fetch)
    .all('*', simpleResourceRouter.fetch)
    .all('*', metaRouter.fetch)
    .all('*', () => error(404, "Couldn't find FHIR mock path"))
