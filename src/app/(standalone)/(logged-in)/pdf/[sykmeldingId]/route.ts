import { proxyRouteHandler } from '@navikt/next-api-proxy'
import { NextRequest } from 'next/server'
import { logger } from '@navikt/next-logger'

import { getApi } from '@core/services/api-fetcher'
import { mockEngineForSession, shouldUseMockEngine } from '@dev/mock-engine'
import { validateHelseIdToken } from '@data-layer/helseid/token/validate'
import { failSpan, spanServerAsync } from '@lib/otel/server'
import { getHelseIdBehandler } from '@data-layer/helseid/helseid-service'

/**
 * Proxies the PDF request to the syk-inn-api service, to the PDF is viewable from the users browser.
 */
export async function GET(request: NextRequest, { params }: RouteContext<'/pdf/[sykmeldingId]'>): Promise<Response> {
    return spanServerAsync('HelseID.pdf-proxy-route', async (span) => {
        const validToken = await validateHelseIdToken()
        if (!validToken) {
            failSpan(span, 'Invalid or missing HelseID token')
            return new Response('Internal server error', { status: 500 })
        }

        const behandler = await getHelseIdBehandler()
        if (behandler?.hpr == null) {
            failSpan(span, 'Behandler without HPR (HelseID)')
            return new Response('Internal server error', { status: 500 })
        }

        request.headers.set('HPR', behandler.hpr)

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
    })
}
