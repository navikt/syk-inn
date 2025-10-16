import { randomUUID } from 'node:crypto'

import { logger as pinoLogger } from '@navikt/pino-logger'
import { HonoRequest } from 'hono'

import { getConfig, getServerSession } from '../config'
import { MockPatients } from '../data/patients'
import { MockLaunchType } from '../server-launch-types'
import { MockPractitioners } from '../data/practitioner'
import { MockOrganizations } from '../data/organization'

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

    const launch = url.searchParams.get('launch') as MockLaunchType | null
    if (!launch) {
        return Response.redirect(
            `${redirectUri}?error=unauthorized_client&error_description=Missing%20launch%20parameter`,
        )
    }

    if (!launch.includes(':')) {
        return new Response('Seems like mock launch parameter is misformed', { status: 400 })
    }

    const launchParts = launch.split(':')
    const launchPatient: MockPatients = launchParts[1] as MockPatients
    const launchPractitioner: MockPractitioners = (launchParts[2] as MockPractitioners) || 'Magnar Koman'
    const launchOrganization: MockOrganizations = (launchParts[3] as MockOrganizations) || 'Magnar Legekontor'

    if (!launchPatient || !launchOrganization || !launchPractitioner) {
        throw Error(`Unknown local dev launch, launch string: ${launch}?`)
    }

    const notATokenCode = randomUUID()
    getServerSession().initializeLaunch(notATokenCode, {
        patient: launchPatient,
        practitioner: launchPractitioner,
        organization: launchOrganization,
    })

    const redirectUrl = `${redirectUri}?code=${notATokenCode}&state=${state}`
    logger.info(`/auth/authorize good, redirecting to ${redirectUrl}`)
    return Response.redirect(redirectUrl, 302)
}
