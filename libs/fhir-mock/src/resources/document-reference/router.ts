import { Hono } from 'hono'
import { FhirDocumentReferenceSchema } from '@navikt/smart-on-fhir/zod'

import { withAuthed } from '../../auth/verify-authed'
import { fhirLogger } from '../../logger'
import { getMockSessionStore } from '../../config'

import { createDocumentReference, getDocumentReferencesListResponse } from './create-document-reference'

export const documentReferenceRouter = new Hono()
    .use('*', withAuthed)
    .get('/', (c) => {
        fhirLogger.info(
            `Getting document reference for patient "${c.req.param('patient')}" by type token ${c.req.param('type')}`,
        )

        return getDocumentReferencesListResponse()
    })
    .post('/', (c) => c.json(createDocumentReference()))
    .put('/:documentReferenceId', async (c) => {
        const accessToken = c.req.header('Authorization')!
        const newId = c.req.param('documentReferenceId')
        const payload = await c.req.json()

        const parsed = FhirDocumentReferenceSchema.safeParse(payload)
        if (!parsed.success) {
            return c.json({ message: 'Unable to parse document reference payload', cause: parsed.error }, 400)
        }

        getMockSessionStore().createDocumentReference(accessToken, parsed.data)

        const docRef = getMockSessionStore().getDocumentReference(accessToken, newId)

        return c.json({ ...docRef, id: newId })
    })
    .get('/:documentReferenceId', (c) => {
        const accessToken = c.req.header('Authorization')!
        const docRef = getMockSessionStore().getDocumentReference(accessToken, c.req.param('documentReferenceId'))
        if (docRef == null) {
            return c.json({ message: 'Unable to find DocumentReference' }, 404)
        }

        return c.json(docRef)
    })
