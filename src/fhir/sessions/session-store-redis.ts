import { createClient, RedisClientType } from '@redis/client'
import { logger } from '@navikt/next-logger'

import { getServerEnv } from '@utils/env'
import { raise } from '@utils/ts'

import { CompleteSession, PartialSession, SessionId, SessionStore } from './session-store'

export class SessionStoreRedis implements SessionStore {
    private readonly client: RedisClientType

    constructor() {
        this.client = createClient({
            url: getServerEnv().REDIS_URL ?? raise("Trying to init Redis, but no 'REDIS_URL' found"),
        })
    }

    async setup(): Promise<void> {
        try {
            await this.client.connect()
        } catch (e) {
            logger.error(new Error('Unable to connect to session redis', { cause: e }))
            throw e
        }
    }

    async cleanup(): Promise<void> {
        await this.client.disconnect()
    }

    public async initSession(sessionId: SessionId, issuer: string): Promise<PartialSession> {
        await this.client.hSet(sessionIdKey(sessionId), { iss: issuer })
        await this.client.expire(sessionIdKey(sessionId), 8 * 60 * 60)

        return { iss: issuer }
    }

    public async isSessionInitiated(sessionId: SessionId): Promise<boolean> {
        return (await this.client.exists(sessionIdKey(sessionId))) > 0
    }

    public async completeAuth(sessionId: string): Promise<CompleteSession> {
        const session = await this.get(sessionId)
        if ('complete' in session) {
            return session
        }

        await this.client.hSet(sessionIdKey(sessionId), { complete: 'true' })

        return { ...session, complete: true }
    }

    public async get(sessionId: SessionId): Promise<PartialSession | CompleteSession> {
        const sessionData = await this.client.hGetAll(sessionIdKey(sessionId))
        if (!sessionData || Object.keys(sessionData).length === 0) {
            throw new Error('Session not found')
        }

        if (sessionData.complete === 'true') {
            return {
                ...sessionData,
                complete: true,
            } as CompleteSession
        }

        return sessionData as PartialSession
    }
}

function sessionIdKey(sessionId: SessionId): string {
    return sessionId.startsWith('session:') ? sessionId : `session:${sessionId}`
}
