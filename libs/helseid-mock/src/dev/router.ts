import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'

import { MOCK_HELSEID_TOKEN_NAME } from '../cookie'

export const devRouter = new Hono().get('/start-user', (c) => {
    const user = c.req.query('user')
    const returnTo = c.req.query('returnTo')

    if (!user || !returnTo) {
        return c.text('Missing user or returnTo query parameter', 400)
    }

    const fakeWonderwallSession = crypto.randomUUID()

    setCookie(c, MOCK_HELSEID_TOKEN_NAME, fakeWonderwallSession)

    return c.redirect(returnTo, 302)
})
