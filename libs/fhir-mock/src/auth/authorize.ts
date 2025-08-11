import { randomUUID } from 'node:crypto'

import { logger as pinoLogger } from '@navikt/pino-logger'
import { HonoRequest } from 'hono'

import { getConfig } from '../config'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK-Auth] ' })

export function authorize(request: HonoRequest): Response {
    const url = new URL(request.url)

    logger.info(
        `/auth/authorize request with params: \n\t${Array.from(url.searchParams.entries())
            .map((it) => it.join(': '))
            .join('\n\t')}`,
    )

    const redirectUri = url.searchParams.get('redirect_uri')
    if (!redirectUri) {
        return new Response('Missing redirect_uri', { status: 400 })
    }

    const clientId = url.searchParams.get('client_id')
    if (getConfig().clients.find((it) => it.clientId == clientId) == null) {
        return Response.redirect(`${redirectUri}?error=unauthorized_client&error_description=Invalid%20client_id`)
    }

    const state = url.searchParams.get('state')
    if (!state) {
        return new Response('Missing state', { status: 400 })
    }

    const notAToken = randomUUID()
    const redirectUrl = `${redirectUri}?code=${notAToken}&state=${state}`

    logger.info(`/auth/authorize good, redirecting to ${redirectUrl}`)
    return Response.redirect(redirectUrl, 302)
}
