import { randomUUID } from 'node:crypto'

import { logger as pinoLogger } from '@navikt/pino-logger'
import { HonoRequest } from 'hono'

import { getConfig, getServerSession } from '../config'
import { Patients } from '../data/patients'

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
        return Response.redirect(
            `${redirectUri}?error=unauthorized_client&error_description=Missing%20state%20parameter`,
        )
    }

    const launch = url.searchParams.get('launch')
    if (!launch) {
        return Response.redirect(
            `${redirectUri}?error=unauthorized_client&error_description=Missing%20launch%20parameter`,
        )
    }

    /**
     * Based on the launch parameter, prime the launch state and select a patient
     */
    let patient: Patients
    if (launch.startsWith('local-dev-launch-')) {
        if (launch.endsWith('espen')) {
            patient = 'Espen Eksempel'
        } else if (launch.endsWith('kari')) {
            patient = 'Kari Normann'
        } else {
            throw Error(`Unknown local dev launch, who is: ${launch.replace('local-dev-launch-', '')}?`)
        }
    } else {
        throw Error(`Unsupported mock launch using parameter ${launch}`)
    }

    const notATokenCode = randomUUID()
    getServerSession().initializeLaunch(notATokenCode, patient)

    const redirectUrl = `${redirectUri}?code=${notATokenCode}&state=${state}`
    logger.info(`/auth/authorize good, redirecting to ${redirectUrl}`)
    return Response.redirect(redirectUrl, 302)
}
