import type Valkey from 'iovalkey'
import * as R from 'remeda'
import { logger } from '@navikt/pino-logger'

import { BruksvilkarClient, createBruksvilkarClient } from '../client'
import { Bruksvilkar, BruksvilkarValkeySchema } from '../schema'

export type AdminBruksvilkarClient = BruksvilkarClient & {
    all: () => Promise<Bruksvilkar[]>
}

export function createAdminBruksvilkarClient(valkey: Valkey): AdminBruksvilkarClient {
    return {
        ...createBruksvilkarClient(valkey),
        all: async () => {
            const allkeys = await valkey.keys(`bruksvilkar:*`)

            const all = await Promise.all(
                allkeys.map(async (key) => {
                    const data = await valkey.hgetall(key)
                    const parsed = BruksvilkarValkeySchema.safeParse(data)
                    if (!parsed.success) {
                        logger.error(`Dirty data in bruksvilkar valkey, skipping. HPR: ${data.hpr ?? 'missing'}`)
                        return null
                    }

                    return parsed.data
                }),
            )

            return all.filter(R.isNonNull)
        },
    }
}
