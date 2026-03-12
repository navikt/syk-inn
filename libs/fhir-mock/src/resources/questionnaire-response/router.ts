import { Hono } from 'hono'
import { FhirQuestionnaireResponseSchema } from '@navikt/smart-on-fhir/zod'

import { withAuthed } from '../../auth/verify-authed'
import { getMockSessionStore } from '../../config'

export const questionnaireResponseRouter = new Hono()
    .use('*', withAuthed)
    .put('/:questionnaire-response-id', async (c) => {
        const accessToken = c.req.header('Authorization')!
        const newId = c.req.param('questionnaire-response-id')
        const payload = await c.req.json()

        const parsed = FhirQuestionnaireResponseSchema.safeParse(payload)
        if (!parsed.success) {
            return c.json({ message: 'Unable to parse questionnaire response payload', cause: parsed.error }, 400)
        }

        getMockSessionStore().createQuestionnaireResponse(accessToken, parsed.data)

        const qr = getMockSessionStore().getQuestionnaireResponse(accessToken, newId)

        return c.json({ ...qr, id: newId })
    })
    .get('/:questionnaire-response-id', (c) => {
        const accessToken = c.req.header('Authorization')!
        const docRef = getMockSessionStore().getQuestionnaireResponse(
            accessToken,
            c.req.param('questionnaire-response-id'),
        )
        if (docRef == null) {
            return c.json({ message: 'Unable to find QuestionnaireResponse' }, 404)
        }

        return c.json(docRef)
    })
