import { logger } from '@navikt/next-logger'

import { getReadyClient } from '@fhir/smart-client'

/**
 * Used to show current status of the token verification lazily in the header
 *
 * Only used for testing purposes in this early phase
 */
export async function GET(): Promise<Response> {
    const client = await getReadyClient({ validate: true })
    if ('error' in client) {
        if (client.error === 'INVALID_TOKEN') {
            logger.error('Session expired or invalid token')
            return new Response('Unauthorized', { status: 401 })
        }

        logger.error(`Failed to instantiate SmartClient(ReadyClient), reason: ${client.error}`)
        return new Response('Internal server error', { status: 500 })
    }

    return Response.json({ ok: 'ok' })
}
