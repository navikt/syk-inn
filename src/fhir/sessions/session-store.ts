import { lazyNextleton } from 'nextleton'

import { bundledEnv } from '@utils/env'
import { SessionStoreInMem } from '@fhir/sessions/session-store-in-mem'

import { SessionStoreValkey } from './session-store-valkey'

export type SessionId = string

export type InitialSession = {
    issuer: string
    codeVerifier: string
    state: string
    authorizationEndpoint: string
    tokenEndpoint: string
}

export type CompleteSession = {
    accessToken: string
    idToken: string
    patient: string
    encounter: string
    webmedPractitioner?: string
}

export type Session = InitialSession & CompleteSession

export interface SessionStore {
    initializeUserSession(sessionId: string, values: InitialSession): Promise<void>
    completeUserSession(sessionId: string, values: CompleteSession): Promise<void>

    getSession(sessionId: string): Promise<Session>
    getPartialSession(sessionId: string): Promise<InitialSession>

    cleanup(): Promise<void>
}

function getSessionStoreImplementation(): SessionStore {
    switch (bundledEnv.NEXT_PUBLIC_RUNTIME_ENV) {
        case 'e2e':
        case 'demo':
            return new SessionStoreInMem()
        case 'local':
        case 'prod-gcp':
        case 'dev-gcp':
            return new SessionStoreValkey()
    }
}

export const getSessionStore = lazyNextleton('session-store', async () => {
    return getSessionStoreImplementation()
})
