import { logger } from '@navikt/next-logger'
import { GraphQLError } from 'graphql/error'

import { getFlag, getUserToggles } from '@core/toggles/unleash'

export async function assertIsPilotUser(sykmelderHpr: string): Promise<void | never> {
    const toggles = await getUserToggles(sykmelderHpr)
    const isPilotUser = getFlag('PILOT_USER', toggles)

    if (isPilotUser) return

    logger.error(`Non-pilot user tried to create a sykmelding, is modal not modalling? HPR: ${sykmelderHpr}`)

    throw new GraphQLError('API_ERROR')
}
