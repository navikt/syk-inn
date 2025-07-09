import { describe, it, expect } from 'vitest'

import { createInMemoryValkey } from '../../data-layer/mock-engine/valkey/InMemValkey'

describe('in memory valkey proxy', () => {
    const hpr = '999'
    const ident = '111'

    it('should handle single hset with sadd', async () => {
        const valkey = createInMemoryValkey()

        const draftKey = 'draft:123'
        const ownershipKey = `ownership:hpr:${hpr}:ident:${ident}`

        valkey.hset(draftKey, {
            draftId: '123',
            values: JSON.stringify({ title: 'Test Draft' }),
            lastUpdated: new Date().toISOString(),
        })

        await valkey.sadd(ownershipKey, draftKey)
        const isMember = await valkey.sismember(ownershipKey, draftKey)
        expect(isMember).toBe(1)

        // Fetch it back
        const draft = await valkey.hgetall(draftKey)
        expect(draft.draftId).toBe('123')
        expect(JSON.parse(draft.values).title).toBe('Test Draft')
    })

    it('should handle multiple drafts to same owner and ident', async () => {
        const valkey = createInMemoryValkey()

        const ownershipKey = `ownership:hpr:${hpr}:ident:${ident}`

        await valkey.hset('draft:1', {
            draftId: '123',
            values: JSON.stringify({ title: 'Test Draft' }),
            lastUpdated: new Date().toISOString(),
        })
        await valkey.sadd(ownershipKey, 'draft:1')

        await valkey.hset('draft:2', {
            draftId: '123',
            values: JSON.stringify({ title: 'Test Draft' }),
            lastUpdated: new Date().toISOString(),
        })
        await valkey.sadd(ownershipKey, 'draft:2')

        expect(await valkey.sismember(ownershipKey, 'draft:1')).toBe(1)
        expect(await valkey.sismember(ownershipKey, 'draft:2')).toBe(1)

        // Sanity check
        expect(await valkey.sismember(ownershipKey, 'draft:3')).toBe(0)
    })
})
