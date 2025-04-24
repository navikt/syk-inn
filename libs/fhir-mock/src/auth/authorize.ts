import { randomUUID } from 'node:crypto'

import { logger as pinoLogger } from '@navikt/pino-logger'
import { HonoRequest } from 'hono'

const logger = pinoLogger.child({}, { msgPrefix: '[FHIR-MOCK-Auth] ' })

export function authorize(request: HonoRequest): Response {
    const url = new URL(request.url)

    logger.info(`/auth/authorize request with params: \n\t${Array.from(url.searchParams.entries()).join('\n\t')}`)

    const redirectUri = url.searchParams.get('redirect_uri')
    if (!redirectUri) {
        return new Response('Missing redirect_uri', { status: 400 })
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
