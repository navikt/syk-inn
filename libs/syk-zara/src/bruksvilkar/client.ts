import { hashToRecord, toHashData, type ValkeyClient } from '../lib/valkey'

import { Bruksvilkar } from './schema'

export type BruksvilkarClient = {
    acceptBruksvilkar: (
        version: `${number}.${number}`,
        user: { hpr: string; name: string; orgnummer: string | null },
        meta: { system: string; commmitHash: string },
    ) => Promise<string>
    hasAcceptedBruksvilkar: (hpr: string) => Promise<{
        acceptedAt: string
        version: `${number}.${number}`
    } | null>
}

export function createBruksvilkarClient(valkey: ValkeyClient): BruksvilkarClient {
    return {
        acceptBruksvilkar: async (version, user, meta) => {
            const key = createKey(user.hpr)
            const acceptedAt = new Date().toISOString()

            await valkey.hset(
                key,
                toHashData({
                    acceptedAt: acceptedAt,
                    name: user.name,
                    hpr: user.hpr,
                    org: user.orgnummer,
                    version: version,
                    system: meta.system,
                    hash: meta.commmitHash,
                    tokenValid: true,
                } satisfies Bruksvilkar),
            )

            return acceptedAt
        },
        hasAcceptedBruksvilkar: async (hpr) => {
            const key = createKey(hpr)

            /**
             * A missing key and an empty hash are indistinguishable in Valkey, so the previous `EXISTS`
             * round trip was redundant, `HGETALL` returns an empty hash for both cases.
             */
            const data = hashToRecord(await valkey.hgetall(key)) as Partial<Record<keyof Bruksvilkar, string>>
            if (!data.acceptedAt || !data.version) {
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
