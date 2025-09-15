import { Hono } from 'hono'
import { FhirPatient } from '@navikt/smart-on-fhir/zod'

import { withAuthed } from '../../auth/verify-authed'
import { getServerSession } from '../../config'

export const patientRouter = new Hono()
    .use('*', withAuthed)
    .get('/', async () => {
        return new Response('Not implemented', { status: 501 })
    })
    .get('/:id', async (c) => {
        const launchedPatient = getServerSession().getSession(c.req.header('Authorization')!)

        if (!launchedPatient) {
            return new Response('Not found', { status: 404 })
        }

        if (launchedPatient.patient.id !== c.req.param('id')) {
            return new Response('Patient was launched, but id was not of the patient', { status: 404 })
        }

        return Response.json(launchedPatient.patient satisfies FhirPatient, { status: 200 })
    })
    .notFound((c) => c.text('Invalid /Patient resource or path'))
