import { evaluateFlags } from '@unleash/nextjs'
import { logger as pinoLogger } from '@navikt/next-logger'
import { connection } from 'next/server'

import { bundledEnv, isE2E, isLocal, isDemo } from '@utils/env'
import { getAndValidateDefinitions } from '@toggles/definitions'

import { developmentTogglesWithCookieOverrides } from './dev/cookie-override'
import { EXPECTED_TOGGLES, ExpectedToggles, Toggle, Toggles } from './toggles'
import { getUnleashSessionId } from './cookie'

export const unleashLogger = pinoLogger.child({}, { msgPrefix: '[UNLEASH-TOGGLES] ' })

const unleashEnvironment = bundledEnv.runtimeEnv === 'prod-gcp' ? 'production' : 'development'

export async function getUserlessToggles(): Promise<Toggles> {
    return getUserToggles(true)
}

/**
 * Preferred way of fetching toggles. Try to always fetch when you have a user ID (HPR) available.
 */
export async function getUserToggles(userId: string): Promise<Toggles>
/**
 * Opt-in for fetching toggles without user context. Should be used sparingly. Use `getUserlessToggles`.
 */
export async function getUserToggles(noUser: true): Promise<Toggles>
/**
 * Fetches a specific users toggles, based an the HPR number.
 */
export async function getUserToggles(userId: string | true): Promise<Toggles> {
    await connection()

    if (isLocal || isDemo || isE2E) return developmentTogglesWithCookieOverrides()

    try {
        const sessionId = await getUnleashSessionId()
        const definitions = await getAndValidateDefinitions()
        const evaluatedFlags = evaluateFlags(definitions, {
            sessionId,
            environment: unleashEnvironment,
            userId: typeof userId === 'string' ? userId : undefined,
        })
        return evaluatedFlags.toggles
    } catch (e) {
        unleashLogger.error(new Error('Failed to get flags from Unleash. Falling back to default flags.', { cause: e }))
        return EXPECTED_TOGGLES.map(
            (it): Toggle => ({
                name: it,
                variant: { name: 'default', enabled: false },
                impressionData: false,
                enabled: false,
            }),
        )
    }
}

export function getFlag(flag: ExpectedToggles, toggles: Toggles): Toggle {
    const toggle = toggles.find((it) => it.name === flag)

    if (toggle == null) {
        return { name: flag, enabled: false, impressionData: false, variant: { name: 'disabled', enabled: false } }
    }

    return toggle
}
