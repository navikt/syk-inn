import { vi, test, describe, expect, beforeEach, afterEach } from 'vitest'
import nock from 'nock'

describe('unleash definitions', () => {
    beforeEach(() => {
        process.env.UNLEASH_SERVER_API_URL = 'http://team-unleash'
        process.env.UNLEASH_SERVER_API_TOKEN = 'foo-bar'

        vi.useFakeTimers()
    })

    afterEach(() => {
        vi.useRealTimers()
        vi.restoreAllMocks()
        vi.resetModules()

        delete process.env.UNLEASH_SERVER_API_URL
    })

    test('fetching toggles should use cache', async () => {
        const { getAndValidateDefinitions } = await import('@core/toggles/definitions')

        const scope = nock('http://team-unleash')
            .get('/api/client/features')
            .once()
            .reply(200, EXAMPLE_UNLEASH_CLIENTS_RESPONSE)

        await getAndValidateDefinitions()
        expect(scope.isDone(), 'First fetch fetched').toBe(true)

        // Uses cache
        vi.advanceTimersByTime(5 * 1000)
        await getAndValidateDefinitions()

        // Still uses cache
        vi.advanceTimersByTime(5 * 1000)
        await getAndValidateDefinitions()
    })

    test('once TTL runs out, it should use previous working value when refetch fails', async () => {
        const { getAndValidateDefinitions } = await import('@core/toggles/definitions')

        const unleashApi = nock('http://team-unleash')

        unleashApi.get('/api/client/features').once().reply(200, EXAMPLE_UNLEASH_CLIENTS_RESPONSE)
        unleashApi.get('/api/client/features').once().reply(400, { bad: 'boi' })

        // Hits first fetch, only once
        await getAndValidateDefinitions()

        expect(unleashApi.pendingMocks(), 'First fetch fetched').length(1)

        // Still uses cache
        vi.advanceTimersByTime(14 * 1000)
        await getAndValidateDefinitions()
        expect(unleashApi.pendingMocks(), 'First fetch fetched').length(1)

        // Hits refetch, which fails, but uses previous valid value
        vi.advanceTimersByTime(2 * 1000)
        await getAndValidateDefinitions()

        expect(unleashApi.pendingMocks(), 'First fetch fetched').length(0)
    })
})

const EXAMPLE_UNLEASH_CLIENTS_RESPONSE = {
    version: 2,
    features: [
        {
            name: 'FOO_BAR_BAZ',
            type: 'release',
            description: 'No variants here',
            enabled: true,
            stale: false,
            impressionData: false,
            project: 'new.payment.flow',
            strategies: [],
            variants: [],
            dependencies: [],
        },
    ],
}
