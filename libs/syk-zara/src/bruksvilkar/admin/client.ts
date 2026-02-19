import type Valkey from 'iovalkey'

import { BruksvilkarClient, BruksvilkarValkeyData, createBruksvilkarClient } from '../client'

export type AdminBruksvilkarClient = BruksvilkarClient & {
    all: () => Promise<BruksvilkarValkeyData[]>
}

export function createAdminBruksvilkarClient(valkey: Valkey): AdminBruksvilkarClient {
    return {
        ...createBruksvilkarClient(valkey),
        all: async () => {
            const allkeys = await valkey.keys(`bruksvilkar:*`)

            const all = await Promise.all(
                allkeys.map(async (key) => {
                    const data = await valkey.hgetall(key)
                    // TODO: Actually zod it
                    return data as unknown as BruksvilkarValkeyData
                }),
            )

            return all
        },
    }
}
