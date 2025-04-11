import { Hono } from 'hono'

import { authorize } from './authorize'
import { tokenExchange } from './token'

export const authRouter = new Hono()
    .post('/token', (c) => tokenExchange(c.req))
    .get('/authorize', (c) => authorize(c.req))
    .notFound((c) => c.text('Invalid auth path'))
