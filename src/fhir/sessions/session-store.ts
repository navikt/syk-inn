import { lazyNextleton } from 'nextleton'

import { bundledEnv } from '@utils/env'

import { SessionStoreInMem } from './session-store-in-mem'
import { SessionStoreRedis } from './session-store-redis'

export type SessionId = string

export type PartialSession = { iss: string }

export type CompleteSession = PartialSession & { complete: true }

export interface SessionStore {
    initSession(sessionId: SessionId, issuer: string): Promise<PartialSession>
    completeAuth(sessionId: string): Promise<CompleteSession>
    isSessionInitiated(sessionId: SessionId): Promise<boolean>
    get(sessionId: SessionId): Promise<PartialSession | CompleteSession>

    setup(): Promise<void>
    cleanup(): Promise<void>
}

function getSessionStoreImplementation(): SessionStore {
    switch (bundledEnv.NEXT_PUBLIC_RUNTIME_ENV) {
        case 'demo':
            return new SessionStoreInMem()
        case 'local':
        case 'prod-gcp':
        case 'dev-gcp':
            return new SessionStoreRedis()
    }
}

export const getSessionStore = lazyNextleton('session-store', async () => {
    const store = getSessionStoreImplementation()

    await store.setup()

    return store
})
