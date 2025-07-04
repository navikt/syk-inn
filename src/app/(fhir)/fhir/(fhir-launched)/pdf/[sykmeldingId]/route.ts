import { proxyRouteHandler } from '@navikt/next-api-proxy'
import { NextRequest } from 'next/server'
import { logger } from '@navikt/next-logger'
import { teamLogger } from '@navikt/next-logger/team-log'

import { getApi } from '@services/api-fetcher'
import { getHpr } from '@fhir/mappers/practitioner'
import { getReadyClient } from '@fhir/smart/smart-client'
import { getServerEnv, isLocalOrDemo } from '@utils/env'
import { base64ExamplePdf } from '@navikt/fhir-mock-server/pdfs'
import { getFlag, getUserlessToggles } from '@toggles/unleash'

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

    if (isLocalOrDemo && !getServerEnv().useLocalSykInnApi) {
        const pdfBuffer = Uint8Array.from(atob(base64ExamplePdf), (c) => c.charCodeAt(0))
        return new Response(pdfBuffer, {
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
