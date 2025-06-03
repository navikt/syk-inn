import { proxyRouteHandler } from '@navikt/next-api-proxy'
import { NextRequest } from 'next/server'
import { logger } from '@navikt/next-logger'

import { getApi } from '@services/api-fetcher'
import { getHpr } from '@fhir/mappers/practitioner'
import { getReadyClient } from '@fhir/smart/smart-client'
import { getServerEnv, isLocalOrDemo } from '@utils/env'
import { base64ExamplePdf } from '@navikt/fhir-mock-server/pdfs'

/**
 * Proxies the PDF request to the syk-inn-api service, to the PDF is viewable from the users browser.
 */
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ sykmeldingId: string }> },
): Promise<Response> {
    const client = await getReadyClient({ validate: true })
    if ('error' in client) {
        return new Response('Internal server error', { status: 500 })
    }
    const practitioner = await client.request(`/${client.fhirUser}`)
    if ('error' in practitioner) {
        return new Response('Internal server error', { status: 500 })
    }

    const hpr = getHpr(practitioner.identifier)
    if (hpr == null) {
        logger.error('Missing HPR identifier in practitioner resource')
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

    return proxyRouteHandler(request, {
        hostname: api.host,
        path: `/api/sykmelding/${(await params).sykmeldingId}/pdf`,
        bearerToken: api.authHeader,
        https: false,
    })
}
