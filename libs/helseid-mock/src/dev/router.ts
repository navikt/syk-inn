import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'

import { MOCK_HELSEID_TOKEN_NAME } from '../cookie'
import { getServerSession } from '../config'
import { helseIdLogger } from '../logger'
import { MockBehandlere } from '../data/behandlere'

export const devRouter = new Hono().get('/start-user', async (c) => {
    const user = c.req.query('user')
    const returnTo = c.req.query('returnTo')

    if (!user || !returnTo) {
        return c.text('Missing user or returnTo query parameter', 400)
    }

    const fakeWonderwallSessionId = crypto.randomUUID()

    setCookie(c, MOCK_HELSEID_TOKEN_NAME, fakeWonderwallSessionId)
    const serverSession = getServerSession()
    await serverSession.initUser(fakeWonderwallSessionId, user as MockBehandlere)

    helseIdLogger.info(`Initializing HelseID session (${fakeWonderwallSessionId}), redirecting to ${returnTo}`)

    return c.redirect(returnTo, 302)
})
