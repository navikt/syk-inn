import { error, Router } from 'itty-router'

import testData from '../../data'
import { withAuthed } from '../../auth/verify-authed'

export const conditionRouter = Router({ base: '/Condition' })
    .all('*', withAuthed)
    .get('/:conditionId', async ({ params }) => {
        const condition = testData.condition.byId(params.conditionId)
        if (!condition) {
            return new Response('Not found', { status: 404 })
        }
        return Response.json(condition)
    })
    .get('/', async (request) => {
        const patientId = new URL(request.url).searchParams.get('patient')
        if (patientId == null) {
            return new Response('Only patient search is implemented', { status: 400 })
        }
        return Response.json(testData.condition.byPatientId(patientId), { status: 200 })
    })
    .all('*', () => error(404, 'Invalid /Condition resource or path'))
