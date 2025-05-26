import { logger } from '@navikt/next-logger'

import { getReadyClient } from '../../../../../../../data-layer/fhir/smart-client'

export async function GET(): Promise<Response> {
    const client = await getReadyClient({ validate: true })
    if ('error' in client) {
        if (client.error === 'INVALID_TOKEN') {
            logger.error('Session expired or invalid token')
            return new Response('Unauthorized', { status: 401 })
        }

        logger.error(
            `Missing sessionId cookie (actual cause: ${client.error}), session expired or middleware not middlewaring?`,
        )
        return new Response('No valid session', { status: 401 })
    }

    const conditionsByEncounter = await client.request(`/Condition?encounter=${client.encounter}`)
    if ('error' in conditionsByEncounter) {
        logger.error('Failed to fetch conditions', { cause: conditionsByEncounter.error })
        return new Response('Failed to fetch conditions', { status: 500 })
    }

    return Response.json(conditionsByEncounter)
}
