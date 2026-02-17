import Valkey from 'iovalkey'

export type BruksvilkarClient = {
    acceptBruksvilkar: (hpr: string, name: string, version: string) => Promise<void>
    hasAcceptedBruksvilkar: (hpr: string) => Promise<{
        acceptedAt: string
        version: string
    } | null>
}

export function createBruksvilkarClient(valkey: Valkey): BruksvilkarClient {
    return {
        acceptBruksvilkar: async (hpr: string, name: string, version: string) => {
            const key = createKey(hpr)
            const acceptedAt = new Date().toISOString()

            await valkey.hset(key, {
                acceptedAt: acceptedAt,
                name: name,
                hpr: hpr,
                version: version,
                tokenValid: true,
            } satisfies BruksvilkarValkeyData)
        },
        hasAcceptedBruksvilkar: async (hpr: string) => {
            const key = createKey(hpr)

            const exists = await valkey.exists(key)
            if (exists === 0) {
                return null
            }

            const data = await valkey.hgetall(key)
            if (!data || !data.acceptedAt || !data.acceptedVersion) {
                return null
            }

            return {
                acceptedAt: data.acceptedAt,
                version: data.acceptedVersion,
            }
        },
    }
}

type BruksvilkarValkeyData = {
    acceptedAt: string
    name: string
    hpr: string
    version: string
    tokenValid: boolean
}

const PREFIX = 'bruksvilkar:'

const createKey = (hpr: string): string => {
    if (hpr.startsWith(PREFIX)) return hpr

    return `${PREFIX}${hpr}`
}
