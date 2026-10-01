import { Hono } from 'hono'

import { helseIdServerMeta } from './data/helseid-server'

export function metaRoutes(app: Hono): void {
    app.get('/.well-known/openid-configuration', (c) => c.json(helseIdServerMeta.wellKnown()))
    app.get('/keys', async (c) => c.json(await helseIdServerMeta.keys()))
}
