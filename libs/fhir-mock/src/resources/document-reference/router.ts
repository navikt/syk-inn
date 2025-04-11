import { Hono } from 'hono'

import { withAuthed } from '../../auth/verify-authed'

import { getDocumentReference } from './get-document-reference'
import { createDocumentReference } from './create-document-reference'

export const documentReferenceRouter = new Hono()
    .use('*', withAuthed)
    .post('/', () => createDocumentReference())
    .get('/:documentReferenceId', (c) => getDocumentReference(c.req, c.req.param('documentReferenceId')))
