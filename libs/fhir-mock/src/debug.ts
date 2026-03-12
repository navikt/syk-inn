import { Hono } from 'hono'

import { getMockSessionStore } from './config'

export const debugRouter = new Hono().get('/store', (c) => {
    const session = getMockSessionStore()

    return c.json(session.dump())
})
