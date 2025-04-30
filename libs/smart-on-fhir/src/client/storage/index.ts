import { logger } from '../logger'

import { CompleteSession, CompleteSessionSchema, InitialSession, InitialSessionSchema } from './schema'

export type SmartStorage = {
    set: (sessionId: string, values: InitialSession | CompleteSession) => Promise<void>
    get: (sessionId: string) => Promise<unknown>
}

export type SmartStorageErrors = { error: 'INVALID_SESSION_STATE' }

export type SafeSmartStorage = {
    set: (sessionId: string, values: InitialSession | CompleteSession) => Promise<void>
    get: (sessionId: string) => Promise<InitialSession | CompleteSession | SmartStorageErrors>
}

export function safeSmartStorage(smartStorage: SmartStorage | Promise<SmartStorage>): SafeSmartStorage {
    return {
        set: async (...args) => {
            return (await smartStorage).set(...args)
        },
        get: async (sessionId) => {
            const raw = await (await smartStorage).get(sessionId)

            const completeParsed = CompleteSessionSchema.safeParse(raw)
            if (!completeParsed.error) return completeParsed.data

            const initialParsed = InitialSessionSchema.safeParse(raw)
            if (initialParsed.error) {
                logger.error(
                    new Error(`SmartSession state for session ${sessionId} is broken`, {
                        cause: initialParsed.error,
                    }),
                )
                return { error: 'INVALID_SESSION_STATE' }
            }

            return initialParsed.data
        },
    }
}
