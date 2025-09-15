import { Hono } from 'hono'
import { FhirBundle, FhirCondition } from '@navikt/smart-on-fhir/zod'

import { withAuthed } from '../../auth/verify-authed'
import { getServerSession } from '../../config'

export const conditionRouter = new Hono()
    .use('*', withAuthed)
    .get('/:conditionId', async (c) => {
        const launchedPatient = getServerSession().getSession(c.req.header('Authorization')!)

        const condition = launchedPatient?.conditions.find((it) => it.id === c.req.param('conditionId'))
        if (!condition) {
            return new Response('Not found', { status: 404 })
        }
        return Response.json(condition satisfies FhirCondition)
    })
    .get('/', async (c) => {
        const encounterId = c.req.query('encounter')
        if (encounterId == null) {
            return new Response('Only encounter search is implemented', { status: 501 })
        }

        const launchedPatient = getServerSession().getSession(c.req.header('Authorization')!)
        if (encounterId !== launchedPatient?.encounter.id) {
            return new Response('Patient was launched, but encounterId was not of the patient', { status: 404 })
        }

        return Response.json(
            {
                resourceType: 'Bundle',
                type: 'searchset',
                entry: launchedPatient.conditions.map((condition) => ({
                    resource: condition,
                })),
            } satisfies FhirBundle<FhirCondition>,
            { status: 200 },
        )
    })
    .notFound((c) => c.text('Invalid /Condition resource or path'))
