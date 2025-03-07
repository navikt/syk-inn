import { logger } from '@navikt/next-logger'

import { ServerStorage } from '@navikt/fhirclient-next'

import { redisClient } from '../../valkey/redis-client'

const PREFIX = 'fhir-session'

export class FhirClientSessionRedis implements ServerStorage {
    private readonly client: ReturnType<typeof redisClient>

    constructor() {
        this.client = redisClient()
    }

    async setup(): Promise<void> {
        if (this.client.isOpen) return

        try {
            await this.client.connect()
        } catch (e) {
            logger.error(new Error('Unable to connect to session redis', { cause: e }))
            throw e
        }
    }

    async set(key: string, value: unknown): Promise<void> {
        await this.client.set(this.key(key), JSON.stringify(value))
    }

    async get(key: string): Promise<unknown> {
        const value = await this.client.get(this.key(key))
        return value ? JSON.parse(value) : null
    }

    async unset(key: string): Promise<boolean> {
        return (await this.client.del(this.key(key))) > 0
    }

    private key(key: string): string {
        return `${PREFIX}:${key}`
    }
}
