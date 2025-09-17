import { getDefinitions } from '@unleash/nextjs'
import * as R from 'remeda'
import QuickLRU from 'quick-lru'

import { failAndThrowSpan, spanServerAsync } from '@lib/otel/server'
import { raise } from '@lib/ts'
import { EXPECTED_TOGGLES } from '@core/toggles/toggles'
import { unleashLogger } from '@core/toggles/unleash'

type ToggleDefinitions = Awaited<ReturnType<typeof getDefinitions>>

const TOGGLES_KEY = 'toggles'

const unleashCache = new QuickLRU<typeof TOGGLES_KEY, ToggleDefinitions>({
    maxAge: 15 * 1000,
    maxSize: 10,
})

let previousValid: ToggleDefinitions | null

/**
 * Fetches the definitions from Unleash and caches them in a simple in-memory cache with 15 seconds TTL.
 *
 * Validates their presence against the expected toggles.
 */
export async function getAndValidateDefinitions(): Promise<ToggleDefinitions> {
    if (unleashCache.has(TOGGLES_KEY)) {
        const cachedToggles = unleashCache.get(TOGGLES_KEY)
        if (cachedToggles != null) {
            unleashLogger.info(
                `Using cached toggles, ttl: ${((unleashCache.expiresIn(TOGGLES_KEY) ?? -1000) / 1000).toFixed(1)}s`,
            )
            return cachedToggles
        }
    }

    try {
        const definitions = await fetchDefinitions()

        unleashCache.set(TOGGLES_KEY, definitions)
        previousValid = definitions

        diffToggles(definitions)

        return definitions
    } catch (e) {
        if (previousValid != null) {
            unleashLogger.error(
                new Error('Failed to fetch toggles from Unleash, using previous valid toggles', { cause: e }),
            )
            return previousValid
        }

        throw new Error('Failed to fetch toggles from Unleash, and no previous valid toggles available', { cause: e })
    }
}

async function fetchDefinitions(): Promise<ToggleDefinitions> {
    return spanServerAsync('unleash: fetch definitions', async (span) => {
        const definitions = getDefinitions({
            appName: 'syk-inn',
            url: `${process.env.UNLEASH_SERVER_API_URL ?? raise('Missing UNLEASH_SERVER_API_URL')}/api/client/features`,
        })

        if ('message' in definitions) {
            failAndThrowSpan(
                span,
                'Unleash Toggles,',
                new Error(`Toggle was 200 OK, but server said: ${definitions.message}`),
            )
        }

        return definitions
    })
}

/**
 * Makes sure that all toggles defined in code are also present in Unleash.
 *
 * Is completely no-op when everything is up to date.
 */
function diffToggles(definitions: ToggleDefinitions): void {
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
}
