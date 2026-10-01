import { Hono } from 'hono'

import { withAuthed } from '../auth/verify-authed'

import data from './data'

export const connectRouter = new Hono().use(withAuthed).get('/userinfo', (c) => c.json(data.behandler.userInfo))
