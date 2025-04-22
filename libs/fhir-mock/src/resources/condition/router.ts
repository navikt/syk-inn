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
        const encounterId = c.req.query('encounter')
        if (encounterId == null) {
            return new Response('Only encounter search is implemented', { status: 400 })
        }
        return Response.json(testData.condition.byEncounterId(encounterId), { status: 200 })
    })
    .notFound((c) => c.text('Invalid /Condition resource or path'))
