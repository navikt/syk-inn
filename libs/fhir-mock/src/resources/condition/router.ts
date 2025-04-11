import { Hono } from 'hono'

import testData from '../../data'
import { withAuthed } from '../../auth/verify-authed'

export const conditionRouter = new Hono()
    .use('*', withAuthed)
    .get('/:conditionId', async (c) => {
        const condition = testData.condition.byId(c.req.param('conditionId'))
        if (!condition) {
            return new Response('Not found', { status: 404 })
        }
        return Response.json(condition)
    })
    .get('/', async (c) => {
        const patientId = c.req.query('patient')
        if (patientId == null) {
            return new Response('Only patient search is implemented', { status: 400 })
        }
        return Response.json(testData.condition.byPatientId(patientId), { status: 200 })
    })
    .notFound((c) => c.text('Invalid /Condition resource or path'))
