import { logger } from '@navikt/next-logger'
import { IRequest } from 'itty-router'

export function withAuthed(req: IRequest): Response | void {
    if (req.headers.get('Authorization') == null) {
        const path = new URL(req.url).pathname

        logger.warn(`Mock resource (${path}) was unauthed, 401ing >:(`)

        return new Response(`Resource ${path} is supposed to be authed, but no Authorized header was found.`, {
            status: 401,
        })
    }
}
