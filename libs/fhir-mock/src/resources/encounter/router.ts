import { Hono } from 'hono'
import { FhirEncounter } from '@navikt/smart-on-fhir/zod'

import { withAuthed } from '../../auth/verify-authed'
import { getServerSession } from '../../config'

export const encounterRouter = new Hono()
    .use('*', withAuthed)
    .get('/', async () => {
        return new Response('Listing all Encounters is not implemented', { status: 501 })
    })
    .get('/:id', async (c) => {
        const launchedPatient = getServerSession().getSession(c.req.header('Authorization')!)

        if (!launchedPatient?.encounter) {
            return new Response('Not found', { status: 404 })
        }

        if (launchedPatient.encounter.id !== c.req.param('id')) {
            return new Response('Patient was launched, but encounter was not of patients', { status: 400 })
        }

        return Response.json(launchedPatient.encounter satisfies FhirEncounter, { status: 200 })
    })
    .notFound((c) => c.text('Invalid /Encounter resource or path'))
