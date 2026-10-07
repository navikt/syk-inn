import { NextRequest } from 'next/server'
import { Readable } from 'node:stream'

import { getHelseIdBehandler, validateHelseIdAccessToken } from '#core/auth/helseid/helseid'
import { gcpBucketClient } from '#core/pdf/bucket/bucket-client'
import { sykInnApiClient } from '#core/services/syk-inn-api/syk-inn-api-client'
import { failSpan, spanServerAsync } from '#lib/otel/server'

export async function GET(_: NextRequest, { params }: RouteContext<'/pdf/[sykmeldingId]'>): Promise<Response> {
    return spanServerAsync('HelseID.pdf-route', async (span) => {
        const { sykmeldingId } = await params
        const validToken = await validateHelseIdAccessToken()
        if (!validToken) {
            failSpan(span, 'Invalid or missing HelseID token')
            return new Response('Internal server error', { status: 500 })
        }

        const behandler = await getHelseIdBehandler()
        if (behandler?.hpr == null) {
            failSpan(span, 'Behandler without HPR (HelseID)')
            return new Response('Internal server error', { status: 500 })
        }

        const sykmelding = await sykInnApiClient.getSykmelding(sykmeldingId, behandler.hpr)
        if ('errorType' in sykmelding) {
            failSpan(span, `Failed to get sykmelding: ${sykmelding.errorType}`)
            return new Response('Internal server error', { status: 500 })
        }

        if (sykmelding.kind === 'redacted') {
            failSpan(span, `Sykmelding is redacted, cannot generate PDF`)
            return new Response('Internal server error', { status: 500 })
        }

        try {
            const metadata = await gcpBucketClient.pdfMetadata(sykmeldingId)
            span.setAttributes({
                'pdf.size': metadata.size,
                'pdf.sykmeldingId': sykmeldingId,
            })

            const file = gcpBucketClient.streamPdfFromBucket(sykmeldingId)
            const stream = Readable.toWeb(file)

            return new Response(stream as ReadableStream<Uint8Array>, {
                headers: {
                    'Content-Type': 'application/pdf',
                    'Content-Disposition': 'inline; filename="sykmelding.pdf"',
                    'Cache-Control': 'private, no-store',
                },
                status: 200,
            })
        } catch (e) {
            failSpan(
                span,
                `Failed to display PDF from bucket`,
                e instanceof Error ? e : new Error('Unknown error', { cause: e }),
            )
            return new Response('Internal server error', { status: 500 })
        }
    })
}
