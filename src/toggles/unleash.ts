import { evaluateFlags, getDefinitions } from '@unleash/nextjs'
import { logger as pinoLogger } from '@navikt/next-logger'
import * as R from 'remeda'
import { cookies } from 'next/headers'
import NodeCache from 'node-cache'
import { connection } from 'next/server'

import { isLocalOrDemo } from '@utils/env'
import { raise } from '@utils/ts'

import { getUnleashEnvironment, localDevelopmentToggles } from './env'
import { EXPECTED_TOGGLES, Toggle, Toggles } from './toggles'
import { UNLEASH_COOKIE_NAME } from './cookie'

const logger = pinoLogger.child({}, { msgPrefix: '[UNLEASH-TOGGLES] ' })

export async function getToggles(): Promise<Toggles> {
    await connection()

    if ((EXPECTED_TOGGLES as readonly string[]).length === 0) {
        logger.info('Currently no expected toggles defined, not fetching toggles from unleash')
        return []
    }

    if (isLocalOrDemo) {
        logger.warn('Running in local or demo mode, falling back to development toggles.')
        return localDevelopmentToggles()
    }

    try {
        const sessionId = await getUnleashSessionId()
        const definitions = await getAndValidateDefinitions()
        const evaluatedFlags = evaluateFlags(definitions, {
            sessionId,
            environment: getUnleashEnvironment(),
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

const unleashCache = new NodeCache({ stdTTL: 15 })

async function getAndValidateDefinitions(): Promise<Awaited<ReturnType<typeof getDefinitions>>> {
    if (unleashCache.has('toggles')) {
        const cachedToggles = unleashCache.get<Awaited<ReturnType<typeof getDefinitions>>>('toggles')
        if (cachedToggles != null) {
            logger.info('Using cached unleash definitions')
            return cachedToggles
        }
    }

    const definitions = await getDefinitions({
        appName: 'syk-inn',
        url: `${process.env.UNLEASH_SERVER_API_URL ?? raise('Missing UNLEASH_SERVER_API_URL')}/api/client/features`,
    })
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
