import { IttyRouter } from 'itty-router'

import { withAuthed } from '../../auth/verify-authed'
import data from '../../data'

export const simpleResourceRouter = IttyRouter({ path: '/*' })
    .get('/Patient/:id', withAuthed, async ({ params }) => {
        if (params.id !== 'cd09f5d4-55f7-4a24-a25d-a5b65c7a8805') {
            return new Response('Not found', { status: 404 })
        }

        return Response.json(data.patient['Espen Eksempel'])
    })
    .get('/Practitioner/:id', withAuthed, async ({ params }) => {
        if (params.id !== 'a1f1ed62-066a-4050-90f7-81e8f62eb3c2') {
            return new Response('Not found', { status: 404 })
        }

        return Response.json(data.practitioner['Koman Magnar'])
    })
    .get('/Encounter/:id', withAuthed, async ({ params }) => {
        if (params.id !== '320fd29a-31b9-4c9f-963c-c6c88332d89a') {
            return new Response('Not found', { status: 404 })
        }

        return Response.json(data.encounter['Espen hos Koman'])
    })
