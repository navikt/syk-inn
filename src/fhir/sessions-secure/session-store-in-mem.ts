import { logger } from '@navikt/next-logger'

import { raise } from '@utils/ts'

import { Session, InitialSession, SessionId, SessionStore } from './session-store'

export class SessionStoreInMem implements SessionStore {
    private _sessions: Record<SessionId, InitialSession | Session> = {}

    public async setup(): Promise<void> {
        logger.info('Setting up in-memory session store (stub)')
    }

    public async cleanup(): Promise<void> {
        logger.info('Cleaning up in-memory session store')

        this._sessions = {}
    }

    public async initSession(sessionId: SessionId, issuer: string): Promise<InitialSession> {
        logger.info(`Initiating session ${sessionId} with issuer ${issuer}`)

        this._sessions[sessionId] = { iss: issuer }

        return this._sessions[sessionId]
    }

    public async isSessionInitiated(sessionId: SessionId): Promise<boolean> {
        logger.info(`Session ${sessionId} initiated: ${this._sessions[sessionId] != null}`)

        return this._sessions[sessionId] != null
    }

    public async completeAuth(sessionId: string): Promise<Session> {
        logger.info(`Completing auth for session ${sessionId}`)

        const session = this._sessions[sessionId]

        if (session == null) {
            throw new Error('Session not initiated')
        }

        this._sessions[sessionId] = { ...session, complete: true }

        return this._sessions[sessionId] as Session
    }

    public async get(sessionId: SessionId): Promise<InitialSession | Session> {
        return this._sessions[sessionId] ?? raise('No session found')
    }
}
