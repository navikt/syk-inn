import { Hono } from 'hono'

import { getServerSession } from './config'

export const debugRouter = new Hono().get('/store', (c) => {
    const session = getServerSession()

    return c.json(session.dump())
})
