import { Hono } from 'hono'

import { helseIdServerMeta } from './data/helseid-server'

export function metaRoutes(app: Hono): void {
    app.get('/.well-known/openid-configuration', (c) => c.json(helseIdServerMeta.wellKnown()))
    app.get('/connect/userinfo', (c) => c.json({ todo: 'impl' }, 500))
}
