import { Hono } from 'hono'

import { authorize } from './authorize'
import { tokenExchange } from './token'

export const authRouter = new Hono()
    .get('/authorize', (c) => authorize(c.req))
    .post('/token', (c) => tokenExchange(c.req))
    .notFound((c) => c.text('Invalid auth path'))
