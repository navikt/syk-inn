import { NextRequest } from 'next/server'

import { validateHelseIdToken } from '@data-layer/helseid/token/validate'
import { failSpan, spanServerAsync } from '@lib/otel/server'
import { getHelseIdBehandler } from '@data-layer/helseid/helseid-service'
import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { createTypstSykmelding } from '@core/pdf/pdf-service'

export async function GET(_: NextRequest, { params }: RouteContext<'/pdf/[sykmeldingId]'>): Promise<Response> {
    return spanServerAsync('HelseID.pdf-route', async (span) => {
        const { sykmeldingId } = await params
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

        const sykmelding = await sykInnApiService.getSykmelding(sykmeldingId, behandler?.hpr)
        if ('errorType' in sykmelding) {
            failSpan(span, `Failed to get sykmelding: ${sykmelding.errorType}`)
            return new Response('Internal server error', { status: 500 })
        }

        if (sykmelding.kind === 'redacted') {
            failSpan(span, `Sykmelding is redacted, cannot generate PDF`)
            return new Response('Internal server error', { status: 500 })
        }

        const pdf = await createTypstSykmelding(sykmelding)
        if (!pdf.ok) {
            failSpan(span, `Failed to generate PDF: ${pdf.error}`)
            return new Response('Internal server error', { status: 500 })
        }

        return new Response(pdf.pdf, {
            headers: { 'Content-Type': 'application/pdf' },
            status: 200,
        })
    })
}
