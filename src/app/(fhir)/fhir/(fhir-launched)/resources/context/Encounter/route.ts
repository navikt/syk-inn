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

    const encounter = await client.request(`/Encounter/${client.encounter}`)
    if ('error' in encounter) {
        logger.error(`Error fetching encounter: ${encounter.error}`)
        return new Response('Error fetching encounter', { status: 500 })
    }

    return Response.json(encounter)
}
