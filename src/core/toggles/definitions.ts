import { getDefinitions } from '@unleash/nextjs'
import * as R from 'remeda'
import QuickLRU from 'quick-lru'

import { failSpan, spanServerAsync } from '@lib/otel/server'
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
    return spanServerAsync('unleash.get-and-validate-definitions', async (span) => {
        if (unleashCache.has(TOGGLES_KEY)) {
            const cachedToggles = unleashCache.get(TOGGLES_KEY)
            if (cachedToggles != null) {
                span.setAttribute('unleash.cached-toggles', true)
                return cachedToggles
            }
        }

        try {
            const definitions = await fetchDefinitions()

            unleashCache.set(TOGGLES_KEY, definitions)
            previousValid = definitions

            diffToggles(definitions)
            span.setAttribute('unleash.cached-toggles', false)

            return definitions
        } catch (e) {
            if (previousValid != null) {
                failSpan(
                    span,
                    'Toggle fallback',
                    new Error('Failed to fetch toggles from Unleash, using previous valid toggles', { cause: e }),
                )

                span.setAttribute('unleash.fallback-hit', true)

                return previousValid
            }

            span.setAttribute('unleash.fallback-hit', false)

            failSpan.andThrow(
                span,
                'Toggle error',
                new Error('Failed to fetch toggles from Unleash, and no previous valid toggles available', {
                    cause: e,
                }),
            )
        }
    })
}

async function fetchDefinitions(): Promise<ToggleDefinitions> {
    return spanServerAsync('unleash: fetch definitions', async (span) => {
        const definitions = getDefinitions({
            appName: 'syk-inn',
            url: `${process.env.UNLEASH_SERVER_API_URL ?? raise('Missing UNLEASH_SERVER_API_URL')}/api/client/features`,
        })

        if ('message' in definitions) {
            failSpan.andThrow(
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
    }
}
