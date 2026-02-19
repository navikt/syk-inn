import Valkey from 'iovalkey'

import { Bruksvilkar } from './schema'

export type BruksvilkarClient = {
    acceptBruksvilkar: (
        version: `${number}.${number}`,
        user: { hpr: string; name: string; orgnummer: string },
        meta: { system: string; commmitHash: string },
    ) => Promise<string>
    hasAcceptedBruksvilkar: (hpr: string) => Promise<{
        acceptedAt: string
        version: `${number}.${number}`
    } | null>
}

export function createBruksvilkarClient(valkey: Valkey): BruksvilkarClient {
    return {
        acceptBruksvilkar: async (version, user, meta) => {
            const key = createKey(user.hpr)
            const acceptedAt = new Date().toISOString()

            await valkey.hset(key, {
                acceptedAt: acceptedAt,
                name: user.name,
                hpr: user.hpr,
                org: user.orgnummer,
                version: version,
                system: meta.system,
                hash: meta.commmitHash,
                tokenValid: true,
            } satisfies Bruksvilkar)

            return acceptedAt
        },
        hasAcceptedBruksvilkar: async (hpr) => {
            const key = createKey(hpr)

            const exists = await valkey.exists(key)
            if (exists === 0) {
                return null
            }

            const data: Record<keyof Bruksvilkar, string> = await valkey.hgetall(key)
            if (!data || !data.acceptedAt || !data.version) {
                return null
            }

            return {
                acceptedAt: data.acceptedAt,
                version: data.version as `${number}.${number}`,
            }
        },
    }
}

const PREFIX = 'bruksvilkar:'

const createKey = (hpr: string): string => {
    if (hpr.startsWith(PREFIX)) return hpr

    return `${PREFIX}${hpr}`
}
