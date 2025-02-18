import { logger } from '@navikt/next-logger'

import { Session, InitialSession, SessionStore } from './session-store'

export class SessionStoreInMem implements SessionStore {
    public async setup(): Promise<void> {
        logger.info('Setting up in-memory session store (stub)')
    }

    public async cleanup(): Promise<void> {
        logger.info('Cleaning up in-memory session store')
    }

    getSecureSession(): Promise<Session> {
        throw new Error('Method not implemented.')
    }
    getSecurePartialSession(): Promise<InitialSession> {
        throw new Error('Method not implemented.')
    }
    initializeSecureUserSession(): Promise<void> {
        throw new Error('Method not implemented.')
    }
    completeSecureUserSession(): Promise<void> {
        throw new Error('Method not implemented.')
    }
}
