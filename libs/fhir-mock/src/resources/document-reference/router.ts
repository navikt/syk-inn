import { Hono } from 'hono'

import { withAuthed } from '../../auth/verify-authed'
import { fhirLogger } from '../../logger'

import { getDocumentReference } from './get-document-reference'
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
    .put('/:documentReferenceId', (c) =>
        c.json({ ...createDocumentReference(), id: c.req.param('documentReferenceId') }),
    )
    .get('/:documentReferenceId', (c) => getDocumentReference(c.req, c.req.param('documentReferenceId')))
