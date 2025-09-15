import { Hono } from 'hono'
import { FhirPractitioner } from '@navikt/smart-on-fhir/zod'

import { withAuthed } from '../../auth/verify-authed'
import { getServerSession } from '../../config'

export const practitionerRouter = new Hono()
    .use('*', withAuthed)
    .get('/:id', async (c) => {
        const practitioner = getServerSession().getPractitioner(c.req.param('id'))
        if (!practitioner) {
            return new Response('Not found', { status: 404 })
        }

        return Response.json(practitioner satisfies FhirPractitioner, { status: 200 })
    })
    .get('/', () => new Response('Practitioners search/lookup not implemented', { status: 501 }))
    .notFound((c) => c.text('Invalid /Practitioner resource or path'))
