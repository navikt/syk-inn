import { nextleton } from 'nextleton'
import { logger } from '@navikt/next-logger'

import { raise } from '@utils/ts'

type SessionId = string

type PartialSession = { iss: string }

type CompleteSession = PartialSession & { complete: true }

class SessionStore {
    private _sessions: Record<SessionId, PartialSession | CompleteSession> = {}

    public initSession(sessionId: SessionId, issuer: string): void {
        logger.info(`Initiating session ${sessionId} with issuer ${issuer}`)

        this._sessions[sessionId] = { iss: issuer }
    }

    public isSessionInitiated(sessionId: SessionId): boolean {
        logger.info(`Session ${sessionId} initiated: ${this._sessions[sessionId] != null}`)

        return this._sessions[sessionId] != null
    }

    public completeAuth(sessionId: string): CompleteSession {
        logger.info(`Completing auth for session ${sessionId}`)

        const session = this._sessions[sessionId]

        if (session == null) {
            throw new Error('Session not initiated')
        }

        this._sessions[sessionId] = { ...session, complete: true }

        return this._sessions[sessionId] as CompleteSession
    }

    public get(sessionId: SessionId): PartialSession | CompleteSession {
        return this._sessions[sessionId] ?? raise('No session found')
    }
}

export const sessionStore = nextleton('session-store', () => new SessionStore())
