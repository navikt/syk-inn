import { MiddlewareHandler } from 'hono'

import { fhirLogger } from '../logger'

export const withAuthed: MiddlewareHandler = async (c, next) => {
    const authHeader = c.req.header('Authorization')
    if (!authHeader) {
        const path = new URL(c.req.url).pathname
        fhirLogger.warn(`Mock resource (${path}) was unauthed, 401ing >:(`)

        return c.text(`Resource ${path} is supposed to be authed, but no Authorization header was found.`, 401)
    }

    await next()
}
