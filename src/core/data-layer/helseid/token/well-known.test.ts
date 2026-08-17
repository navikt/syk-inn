import nock from 'nock'
import { vi, test, describe, expect, beforeEach, afterEach, afterAll } from 'vitest'

import type { HelseIdWellKnown } from './well-known'

describe('HelseID well known', () => {
    afterAll(() => {
        vi.restoreAllMocks()
    })

    beforeEach(() => {
        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
        vi.resetModules()
    })

    test('fetching toggles should use cache', async () => {
        const { getHelseIdWellKnown } = await import('./well-known')

        const scope = nock('http://localhost:3000/api/mocks/helseid')
            .get('/.well-known/openid-configuration')
            .once()
            .reply(200, DUMMY_HELSEID_WELL_KNOWN_RESPONSE)

        await getHelseIdWellKnown()
        expect(scope.isDone(), 'First fetch fetched').toBe(true)

        // Uses cache
        vi.advanceTimersByTime(5 * 1000)
        await getHelseIdWellKnown()

        // Still uses cache
        vi.advanceTimersByTime(5 * 1000)
        await getHelseIdWellKnown()
    })

    test('once TTL runs out, it should refetch', async () => {
        const { getHelseIdWellKnown } = await import('./well-known')

        const scope = nock('http://localhost:3000/api/mocks/helseid')

        scope.get('/.well-known/openid-configuration').once().reply(200, DUMMY_HELSEID_WELL_KNOWN_RESPONSE)
        scope.get('/.well-known/openid-configuration').once().reply(200, DUMMY_HELSEID_WELL_KNOWN_RESPONSE)

        // Hits first fetch, only once
        await getHelseIdWellKnown()

        expect(scope.pendingMocks(), 'First fetch fetched').length(1)

        // Still uses cache
        vi.advanceTimersByTime(14 * 1000)
        await getHelseIdWellKnown()
        expect(scope.pendingMocks(), 'First fetch fetched').length(1)

        // Hits refetch, which fails, but uses previous valid value
        vi.advanceTimersByTime(24 * 60 * 60 * 1000 + 1000)
        await getHelseIdWellKnown()

        expect(scope.pendingMocks(), 'First fetch fetched').length(0)
    })
})

const DUMMY_HELSEID_WELL_KNOWN_RESPONSE: HelseIdWellKnown = {
    issuer: 'http://localhost:3000/api/mocks/helseid',
    jwks_uri: 'http://localhost:3000/api/mocks/helseid/jwks',
    userinfo_endpoint: 'http://localhost:3000/api/mocks/helseid/userinfo',
}
