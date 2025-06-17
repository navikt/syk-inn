import { evaluateFlags, getDefinitions } from '@unleash/nextjs'
import { logger as pinoLogger } from '@navikt/next-logger'
import * as R from 'remeda'
import { cookies } from 'next/headers'
import NodeCache from 'node-cache'
import { connection } from 'next/server'

import { bundledEnv, isE2E, isLocalOrDemo } from '@utils/env'
import { raise } from '@utils/ts'
import { spanAsync } from '@otel/otel'

import { localDevelopmentToggles } from './dev'
import { EXPECTED_TOGGLES, ExpectedToggles, Toggle, Toggles } from './toggles'
import { UNLEASH_COOKIE_NAME } from './cookie'

const logger = pinoLogger.child({}, { msgPrefix: '[UNLEASH-TOGGLES] ' })

const unleashEnvironment = bundledEnv.NEXT_PUBLIC_RUNTIME_ENV === 'prod-gcp' ? 'production' : 'development'

export async function getToggles(userId: string | null): Promise<Toggles> {
    await connection()

    if ((EXPECTED_TOGGLES as readonly string[]).length === 0) {
        logger.info('Currently no expected toggles defined, not fetching toggles from unleash')
        return []
    }

    if (isLocalOrDemo || isE2E) {
        logger.warn(
            `Running in local or demo mode, falling back to development toggles, current toggles: \n${localDevelopmentToggles.map((it) => `\t${it.name}: ${it.enabled}`).join('\n')}`,
        )

        const cookieStore = await cookies()
        return localDevelopmentToggles.map((it) => ({
            ...it,
            enabled: cookieStore.get(it.name)?.value.includes('true') ?? it.enabled,
        }))
    }

    try {
        const sessionId = await getUnleashSessionId()
        const definitions = await getAndValidateDefinitions()
        const evaluatedFlags = evaluateFlags(definitions, {
            sessionId,
            environment: unleashEnvironment,
            userId: userId ?? '',
        })
        return evaluatedFlags.toggles
    } catch (e) {
        logger.error(new Error('Failed to get flags from Unleash. Falling back to default flags.', { cause: e }))
        return EXPECTED_TOGGLES.map(
            (it): Toggle => ({
                name: it,
                variant: {
                    name: 'default',
                    // Default to on if failed
                    enabled: true,
                },
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

const unleashCache = new NodeCache({ stdTTL: 15 })

async function getAndValidateDefinitions(): Promise<Awaited<ReturnType<typeof getDefinitions>>> {
    if (unleashCache.has('toggles')) {
        const cachedToggles = unleashCache.get<Awaited<ReturnType<typeof getDefinitions>>>('toggles')
        if (cachedToggles != null) {
            logger.info('Using cached unleash definitions')
            return cachedToggles
        }
    }

    const definitions = await spanAsync('unleash: fetch toggles', () =>
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
        logger.error(
            `Difference in expected flags and flags in unleash, expected but not in unleash: ${diff.join(', ')}`,
        )
    } else {
        logger.info(
            `Fetched ${definitions.features.length} flags from unleash, found all ${EXPECTED_TOGGLES.length} expected flags`,
        )
    }

    return definitions
}

async function getUnleashSessionId(): Promise<string> {
    const existingUnleashId = (await cookies()).get(UNLEASH_COOKIE_NAME)
    if (existingUnleashId != null) {
        return existingUnleashId.value
    } else {
        logger.warn('No existing unleash session id found, is middleware not configured?')
        return '0'
    }
}
