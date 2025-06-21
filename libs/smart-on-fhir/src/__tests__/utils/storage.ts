import { Mock, vi } from 'vitest'

import { SmartStorage } from '../../client'

export function createTestStorage(): SmartStorage {
    const inMem = new Map()

    return {
        set: async (sessionId, values) => {
            inMem.set(sessionId, values)
        },
        get: async (sessionId) => inMem.get(sessionId),
    }
}

export function createMockedStorage(): SmartStorage & { getFn: Mock; setFn: Mock } {
    const getFn = vi.fn()
    const setFn = vi.fn()
    return {
        get: getFn,
        set: setFn,
        getFn,
        setFn,
    }
}
