import { evaluateFlags, flagsClient } from '@unleash/nextjs'
import { logger as pinoLogger } from '@navikt/next-logger'
import { connection } from 'next/server'

import { bundledEnv, isE2E, isLocal, isDemo } from '@lib/env'
import { getAndValidateDefinitions } from '@core/toggles/definitions'

import { developmentTogglesWithCookieOverrides } from './dev/cookie-override'
import { EXPECTED_TOGGLES, ExpectedToggles, Toggle } from './toggles'
import { getUnleashSessionId } from './cookie'

export const unleashLogger = pinoLogger.child({}, { msgPrefix: '[UNLEASH-TOGGLES] ' })

const unleashEnvironment = bundledEnv.runtimeEnv === 'prod-gcp' ? 'production' : 'development'

type UnleashClient = ReturnType<typeof flagsClient>

export async function getUserlessToggles(): Promise<UnleashClient> {
    return getUserToggles(true)
}

/**
 * Preferred way of fetching toggles. Try to always fetch when you have a user ID (HPR) available.
 */
export async function getUserToggles(userId: string): Promise<UnleashClient>
/**
 * Opt-in for fetching toggles without user context. Should be used sparingly. Use `getUserlessToggles`.
 */
export async function getUserToggles(noUser: true): Promise<UnleashClient>
/**
 * Fetches a specific users toggles, based an the HPR number.
 */
export async function getUserToggles(userId: string | true): Promise<UnleashClient> {
    await connection()

    if (isLocal || isDemo || isE2E) return flagsClient(await developmentTogglesWithCookieOverrides())

    try {
        const sessionId = await getUnleashSessionId()
        const definitions = await getAndValidateDefinitions()
        const evaluatedFlags = evaluateFlags(definitions, {
            sessionId,
            environment: unleashEnvironment,
            userId: typeof userId === 'string' ? userId : undefined,
        })
        return flagsClient(evaluatedFlags.toggles)
    } catch (e) {
        unleashLogger.error(new Error('Failed to get flags from Unleash. Falling back to default flags.', { cause: e }))
        return flagsClient(
            EXPECTED_TOGGLES.map(
                (it): Toggle => ({
                    name: it,
                    variant: { name: 'default', enabled: false },
                    impressionData: false,
                    enabled: false,
                }),
            ),
        )
    }
}

export function getFlag(flag: ExpectedToggles, toggles: UnleashClient): boolean {
    const enabled = toggles.isEnabled(flag)

    if (['dev-gcp', 'prod-gcp'].includes(bundledEnv.runtimeEnv)) {
        toggles.sendMetrics().catch((e) => {
            unleashLogger.error(new Error('Tried to send toggle metrics, but failed', { cause: e }))
        })
    }

    return enabled
}
