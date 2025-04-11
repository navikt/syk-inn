import { error, Router } from 'itty-router'

import { authorize } from './authorize'
import { tokenExchange } from './token'

export const authRouter = Router({ base: '/auth/*' })
    .post('/token', tokenExchange)
    .get('/authorize', authorize)
    .all('*', () => error(404, 'Invalid auth path'))
