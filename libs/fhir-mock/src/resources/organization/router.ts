import { Hono } from 'hono'
import { FhirBundle, FhirOrganization } from '@navikt/smart-on-fhir/zod'

import testData from '../../data'
import { withAuthed } from '../../auth/verify-authed'

export const organizationRouter = new Hono()
    .use('*', withAuthed)
    .get('/:organizationId', async (c) => {
        const condition = testData.organization.byId(c.req.param('organizationId'))
        if (!condition) {
            return new Response('Not found', { status: 404 })
        }
        return Response.json(condition)
    })
    .get('/', async () => {
        return Response.json(
            {
                resourceType: 'Bundle',
                type: 'searchset',
                entry: testData.organization.all().map((org) => ({
                    resource: org,
                })),
            } satisfies FhirBundle<FhirOrganization>,
            { status: 200 },
        )
    })
    .notFound((c) => c.text('Invalid /Organization resource or path'))
