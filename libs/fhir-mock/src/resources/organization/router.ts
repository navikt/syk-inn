import { Hono } from 'hono'
import { FhirBundle, FhirOrganization } from '@navikt/smart-on-fhir/zod'

import { withAuthed } from '../../auth/verify-authed'
import { getServerSession } from '../../config'

export const organizationRouter = new Hono()
    .use('*', withAuthed)
    .get('/:organizationId', async (c) => {
        const organization = getServerSession().getOrganization(c.req.param('organizationId'))
        if (!organization) {
            return new Response('Not found', { status: 404 })
        }

        return Response.json(organization satisfies FhirOrganization, { status: 200 })
    })
    .get('/', async () => {
        return Response.json(
            {
                resourceType: 'Bundle',
                type: 'searchset',
                entry: getServerSession()
                    .getAllOrganizations()
                    .map((org) => ({
                        resource: org,
                    })),
            } satisfies FhirBundle<FhirOrganization>,
            { status: 200 },
        )
    })
    .notFound((c) => c.text('Invalid /Organization resource or path'))
