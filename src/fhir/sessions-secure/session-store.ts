import { lazyNextleton } from 'nextleton'

import { bundledEnv } from '@utils/env'
import { raise } from '@utils/ts'

import { SessionStoreRedis } from './session-store-redis'

export type SessionId = string

export type InitialSession = {
    issuer: string
    codeVerifier: string
    authorizationEndpoint: string
    tokenEndpoint: string
}

export type CompleteSession = {
    accessToken: string
    idToken: string
    patient: string
    encounter: string
}

export type Session = InitialSession & CompleteSession

export interface SessionStore {
    getSecureSession(sessionId: string): Promise<Session>
    getSecurePartialSession(sessionId: string): Promise<InitialSession>

    initializeSecureUserSession(sessionId: string, values: InitialSession): Promise<void>
    completeSecureUserSession(sessionId: string, values: CompleteSession): Promise<void>

    setup(): Promise<void>
    cleanup(): Promise<void>
}

function getSessionStoreImplementation(): SessionStore {
    switch (bundledEnv.NEXT_PUBLIC_RUNTIME_ENV) {
        case 'e2e':
        case 'demo':
            // return new SessionStoreInMem()
            raise('TODO: Implement im memory')
        case 'local':
        case 'prod-gcp':
        case 'dev-gcp':
            return new SessionStoreRedis()
    }
}

export const getSessionStore = lazyNextleton('session-store-1', async () => {
    const store = getSessionStoreImplementation()

    await store.setup()

    return store
})
