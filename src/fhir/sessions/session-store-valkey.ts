import * as R from 'remeda'
import { createClient, ValkeyClientType } from 'valkey'
import { logger } from '@navikt/next-logger'

import { raise } from '@utils/ts'
import { getServerEnv } from '@utils/env'

import { CompleteSession, InitialSession, Session, SessionId, SessionStore } from './session-store'

export class SessionStoreValkey implements SessionStore {
    private readonly client: ValkeyClientType

    constructor() {
        const valkeyConfig = getServerEnv().valkeyConfig ?? raise('Valkey config is not set! :(')

        this.client = createClient({
            ...R.omit(valkeyConfig, ['runtimeEnv']),
            socket: {
                connectTimeout: 5000,
                keepAlive: 5000,
            },
            pingInterval: 10 * 1000,
        })

        this.client.on('error', (err: Error) => logger.error(err))
        this.client.on('connect', () => logger.info('Valkey Client Connected'))
        this.client.on('ready', () => logger.info('Valkey Client Ready'))
    }

    async setup(): Promise<void> {
        if (this.client.isOpen) {
            return
        }

        try {
            await this.client.connect()
        } catch (e) {
            logger.error(new Error('Unable to connect to session valkey', { cause: e }))
            throw e
        }
    }

    async cleanup(): Promise<void> {
        if (!this.client.isOpen) {
            return
        }

        await this.client.disconnect()
    }

    async initializeUserSession(sessionId: string, partialSession: InitialSession): Promise<void> {
        await this.client.hSet(sessionIdKey(sessionId), partialSession)
        await this.client.expire(sessionIdKey(sessionId), 8 * 60 * 60)
    }

    async completeUserSession(sessionId: string, values: CompleteSession): Promise<void> {
        await this.client.hSet(sessionIdKey(sessionId), values)
    }

    async getPartialSession(sessionId: string): Promise<InitialSession> {
        const sessionData = await this.client.hGetAll(sessionIdKey(sessionId))
        if (!sessionData || Object.keys(sessionData).length === 0) {
            throw new Error('No secure session found in valkey')
        }

        // TODO: Should probably zod it
        return sessionData as InitialSession
    }

    async getSession(sessionId: string): Promise<Session> {
        const sessionData = await this.client.hGetAll(sessionIdKey(sessionId))
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
