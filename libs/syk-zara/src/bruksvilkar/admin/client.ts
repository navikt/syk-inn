import { logger } from '@navikt/pino-logger'
import * as R from 'remeda'

import { hashToRecord, scanKeys, type ValkeyClient } from '../../lib/valkey'
import { BruksvilkarClient, createBruksvilkarClient } from '../client'
import { Bruksvilkar, BruksvilkarValkeySchema } from '../schema'

export type AdminBruksvilkarClient = BruksvilkarClient & {
    all: () => Promise<Bruksvilkar[]>
}

export function createAdminBruksvilkarClient(valkey: ValkeyClient): AdminBruksvilkarClient {
    return {
        ...createBruksvilkarClient(valkey),
        all: async () => {
            const allKeys = await scanKeys(valkey, `bruksvilkar:*`)

            const all = await Promise.all(
                allKeys.map(async (key) => {
                    const data = hashToRecord(await valkey.hgetall(key))
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
