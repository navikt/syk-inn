import { SmartStorage } from '../../client'

export const createTestStorage = (): SmartStorage => {
    const inMem = new Map()

    return {
        set: async (sessionId, values) => {
            inMem.set(sessionId, values)
        },
        get: async (sessionId) => inMem.get(sessionId),
    }
}
