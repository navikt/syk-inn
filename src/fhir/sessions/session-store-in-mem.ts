import { logger } from '@navikt/next-logger'

import { Session, InitialSession, SessionStore, SessionId, CompleteSession } from './session-store'

export class SessionStoreInMem implements SessionStore {
    private _sessions: Record<SessionId, InitialSession | CompleteSession> = {}

    public async cleanup(): Promise<void> {
        logger.info('Cleaning up in-memory session store')

        this._sessions = {}
    }

    async initializeUserSession(sessionId: string, values: InitialSession): Promise<void> {
        logger.info(`Initiating session ${sessionId} with issuer ${values.issuer}`)

        this._sessions[sessionId] = values
    }

    async completeUserSession(sessionId: string, values: CompleteSession): Promise<void> {
        logger.info(`Completing auth for session ${sessionId}`)

        const partialSession = await this.getPartialSession(sessionId)
        this._sessions[sessionId] = {
            ...partialSession,
            ...values,
        } satisfies Session
    }

    async getSession(sessionId: string): Promise<Session> {
        const session = this._sessions[sessionId]
        if (session == null) {
            throw new Error(`Session ${sessionId} not found`)
        }
        if (!('accessToken' in session)) {
            throw new Error(`Session ${sessionId} is not complete`)
        }

        return session as Session
    }

    async getPartialSession(sessionId: string): Promise<InitialSession> {
        const session = this._sessions[sessionId]
        if (session == null) {
            throw new Error(`Session ${sessionId} not found`)
        }

        return session as InitialSession
    }
}
