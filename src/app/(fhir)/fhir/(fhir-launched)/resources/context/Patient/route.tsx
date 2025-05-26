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

    const patientResponse = await client.request(`/Patient/${client.patient}`)
    if ('error' in patientResponse) {
        logger.error(`Failed to fetch Patient resource: ${patientResponse.error}`)
        return new Response('Failed to fetch Patient resource', { status: 500 })
    }

    return Response.json(patientResponse)
}
