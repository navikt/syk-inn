import { Hono } from 'hono'
import { logger } from '@navikt/next-logger'

import { withAuthed } from '../../auth/verify-authed'

import { getDocumentReference } from './get-document-reference'
import { createDocumentReference, getDocumentReferencesListResponse } from './create-document-reference'

export const documentReferenceRouter = new Hono()
    .use('*', withAuthed)
    .get('/', (c) => {
        logger.info(
            `Getting document reference for patient "${c.req.param('patient')}" by type token ${c.req.param('type')}`,
        )

        return getDocumentReferencesListResponse()
    })
    .post('/', (c) => c.json(createDocumentReference()))
    .get('/:documentReferenceId', (c) => getDocumentReference(c.req, c.req.param('documentReferenceId')))
