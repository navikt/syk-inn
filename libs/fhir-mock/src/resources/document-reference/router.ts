import { Router } from 'itty-router'

import { withAuthed } from '../../auth/verify-authed'

import { getDocumentReference } from './get-document-reference'
import { createDocumentReference } from './create-document-reference'

export const documentReferenceRouter = Router({ base: '/DocumentReference' })
    .all('*', withAuthed)
    .post('/', createDocumentReference)
    .get('/:documentReferenceId', ({ params, ...request }) => getDocumentReference(request, params.documentReferenceId))
