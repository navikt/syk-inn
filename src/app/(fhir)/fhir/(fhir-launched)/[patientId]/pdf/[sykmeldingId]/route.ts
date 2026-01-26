import { proxyRouteHandler } from '@navikt/next-api-proxy'
import { NextRequest } from 'next/server'
import { logger } from '@navikt/next-logger'
import { teamLogger } from '@navikt/next-logger/team-log'

import { getApi } from '@core/services/api-fetcher'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { getReadyClient } from '@data-layer/fhir/smart/ready-client'
import { mockEngineForSession, shouldUseMockEngine } from '@dev/mock-engine'
import { gotenbergService } from '@data-layer/pdf/gotenberg-service'
import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'

/**
 * Proxies the PDF request to the syk-inn-api service, to the PDF is viewable from the users browser.
 */
export async function GET(
    request: NextRequest,
    { params }: RouteContext<'/fhir/[patientId]/pdf/[sykmeldingId]'>,
): Promise<Response> {
    const { patientId, sykmeldingId } = await params
    const client = await getReadyClient(patientId)
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

    if (request.nextUrl.searchParams.get('gotenberg') != null) {
        const sykmelding = await sykInnApiService.getSykmelding(sykmeldingId, hpr)
        if ('errorType' in sykmelding) {
            logger.error(`Failed to fetch sykmelding ${sykmeldingId}: ${sykmelding.errorType}`)
            return new Response('Internal server error', { status: 500 })
        }
        if (sykmelding.kind === 'redacted') {
            logger.error(`Cannot generate PDF via Gotenberg for redacted sykmelding ${sykmeldingId}`)
            return new Response('Internal server error', { status: 500 })
        }

        if (request.nextUrl.searchParams.get('gotenberg') === 'html') {
            return new Response(await gotenbergService.debugGotenbergPdfHtml(sykmelding), {
                headers: { 'Content-Type': 'text/html' },
                status: 200,
            })
        }

        return new Response(await gotenbergService.generateGotenbergPdf(sykmelding), {
            headers: { 'Content-Type': 'application/pdf' },
            status: 200,
        })
    }

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
        path: `/api/sykmelding/${sykmeldingId}/pdf`,
        bearerToken: api.token,
        https: false,
    })

    response.headers.set('X-Frame-Options', 'SAMEORIGIN')

    return response
}
