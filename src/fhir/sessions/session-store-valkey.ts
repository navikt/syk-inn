import Valkey from 'iovalkey'
import { logger } from '@navikt/next-logger'
import * as R from 'remeda'

import { getServerEnv } from '@utils/env'

import { CompleteSession, InitialSession, Session, SessionId, SessionStore } from './session-store'

export class SessionStoreValkey implements SessionStore {
    private client: Valkey

    constructor() {
        const valkeyConfig =
            getServerEnv().valkeyConfig ??
            (() => {
                throw new Error('Valkey config is not set! :(')
            })()

        this.client = new Valkey({
            ...R.omit(valkeyConfig, ['runtimeEnv']),
            connectTimeout: 5000,
            keepAlive: 5000,
        })

        this.client.on('error', (err: Error) => logger.error(err))
        this.client.on('connect', () => logger.info('Valkey Client Connected'))
        this.client.on('ready', () => logger.info('Valkey Client Ready'))
    }

    async cleanup(): Promise<void> {
        if (this.client.status !== 'close') {
            return
        }

        this.client.disconnect()
    }

    async initializeUserSession(sessionId: string, partialSession: InitialSession): Promise<void> {
        await this.client.hset(sessionIdKey(sessionId), partialSession)
        await this.client.expire(sessionIdKey(sessionId), 8 * 60 * 60)
    }

    async completeUserSession(sessionId: string, values: CompleteSession): Promise<void> {
        await this.client.hset(sessionIdKey(sessionId), values)
    }

    async getPartialSession(sessionId: string): Promise<InitialSession> {
        const sessionData = await this.client.hgetall(sessionIdKey(sessionId))
        if (!sessionData || Object.keys(sessionData).length === 0) {
            throw new Error('No secure session found in valkey')
        }

        // TODO: Should probably zod it
        return sessionData as InitialSession
    }

    async getSession(sessionId: string): Promise<Session> {
        const sessionData = await this.client.hgetall(sessionIdKey(sessionId))
        if (!sessionData || Object.keys(sessionData).length === 0) {
            throw new Error('No secure session found in valkey')
        }

        // TODO: Should probably zod it
        return sessionData as Session
    }
}

function sessionIdKey(sessionId: SessionId): string {
    return sessionId.startsWith('secure-session:') ? sessionId : `secure-session:${sessionId}`
}
