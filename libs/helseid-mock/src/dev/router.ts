import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'

import { getServerSession } from '../config'
import { MOCK_HELSEID_TOKEN_NAME } from '../cookie'
import { helseIdLogger } from '../logger'

export const devRouter = new Hono().get('/start-user', async (c) => {
    const returnTo = c.req.query('returnTo')

    if (!returnTo) {
        return c.text('Missing returnTo query parameter', 400)
    }

    const fakeWonderwallSessionId = crypto.randomUUID()

    setCookie(c, MOCK_HELSEID_TOKEN_NAME, fakeWonderwallSessionId)
    const serverSession = getServerSession()
    await serverSession.initUser(fakeWonderwallSessionId)

    helseIdLogger.info(`Initializing HelseID session (${fakeWonderwallSessionId}), redirecting to ${returnTo}`)

    return c.redirect(returnTo, 302)
})
