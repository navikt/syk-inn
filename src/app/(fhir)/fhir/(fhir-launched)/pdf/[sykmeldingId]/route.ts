import { proxyRouteHandler } from '@navikt/next-api-proxy'
import { NextRequest } from 'next/server'
import { logger } from '@navikt/next-logger'
import { teamLogger } from '@navikt/next-logger/team-log'

import { getApi } from '@core/services/api-fetcher'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { getReadyClient } from '@data-layer/fhir/smart/ready-client'
import { getFlag, getUserlessToggles } from '@core/toggles/unleash'
import { mockEngineForSession, shouldUseMockEngine } from '@dev/mock-engine'

/**
 * Proxies the PDF request to the syk-inn-api service, to the PDF is viewable from the users browser.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sykmeldingId: string }> },
): Promise<Response> {
    const autoTokenRefresh = getFlag('SYK_INN_REFRESH_TOKEN', await getUserlessToggles()).enabled
    const client = await getReadyClient({ validate: true, autoRefresh: autoTokenRefresh })
    if ('error' in client) {
        return new Response('Internal server error', { status: 500 })
    }
    const practitioner = await client.user.request()
    if ('error' in practitioner) {
        return new Response('Internal server error', { status: 500 })
    }

    const hpr = getHpr(practitioner.identifier)
    if (hpr == null) {
        logger.error('Missing HPR identifier in practitioner resource')
        teamLogger.error(`Practitioner without HPR: ${JSON.stringify(practitioner, null, 2)}`)
        return new Response('Internal server error', { status: 500 })
    }

    request.headers.set('HPR', hpr)

    if (shouldUseMockEngine()) {
        const mockEngine = await mockEngineForSession()

        return new Response(mockEngine.sykInnApi.getPdf(), {
            headers: { 'Content-Type': 'application/pdf' },
            status: 200,
        })
    }

    const api = await getApi('syk-inn-api')
    if ('errorType' in api) {
        logger.error(`Failed to fetch 'syk-inn-api' configuration: ${api.errorType}`)
        return new Response('Internal server error', { status: 500 })
    }

    const proxyOptions = api.host.includes('localhost')
        ? {
              hostname: api.host.split(':')[0],
              port: api.host.split(':')[1],
          }
        : {
              hostname: api.host,
          }

    const response = await proxyRouteHandler(request, {
        ...proxyOptions,
        path: `/api/sykmelding/${(await params).sykmeldingId}/pdf`,
        bearerToken: api.token,
        https: false,
    })

    response.headers.set('X-Frame-Options', 'SAMEORIGIN')

    return response
}
