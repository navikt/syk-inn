import { getDefinitions } from '@unleash/nextjs'
import * as R from 'remeda'
import NodeCache from 'node-cache'

import { spanAsync } from '@otel/otel'
import { raise } from '@utils/ts'
import { EXPECTED_TOGGLES } from '@toggles/toggles'
import { unleashLogger } from '@toggles/unleash'

const unleashCache = new NodeCache({ stdTTL: 15 })

/**
 * Fetches the definitions from Unleash and caches them in a simple in-memory cache with 15 seconds TTL.
 *
 * Validates their presence against the expected toggles.
 */
export async function getAndValidateDefinitions(): Promise<Awaited<ReturnType<typeof getDefinitions>>> {
    if (unleashCache.has('toggles')) {
        const cachedToggles = unleashCache.get<Awaited<ReturnType<typeof getDefinitions>>>('toggles')
        if (cachedToggles != null) {
            unleashLogger.info('Using cached unleash definitions')
            return cachedToggles
        }
    }

    const definitions = await spanAsync('unleash: fetch toggles', async () =>
        getDefinitions({
            appName: 'syk-inn',
            url: `${process.env.UNLEASH_SERVER_API_URL ?? raise('Missing UNLEASH_SERVER_API_URL')}/api/client/features`,
        }),
    )
    if ('message' in definitions) {
        throw new Error(`Toggle was 200 OK, but server said: ${definitions.message}`)
    }

    unleashCache.set('toggles', definitions)

    const diff = R.difference(
        EXPECTED_TOGGLES,
        R.map(definitions.features, (it) => it.name),
    )

    if (diff.length > 0) {
        unleashLogger.error(
            `Difference in expected flags and flags in unleash, expected but not in unleash: ${diff.join(', ')}`,
        )
    } else {
        unleashLogger.info(
            `Fetched ${definitions.features.length} flags from unleash, found all ${EXPECTED_TOGGLES.length} expected flags`,
        )
    }

    return definitions
}
