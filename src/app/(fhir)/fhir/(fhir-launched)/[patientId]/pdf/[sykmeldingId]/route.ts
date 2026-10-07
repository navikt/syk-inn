import { NextRequest } from 'next/server'
import { Readable } from 'node:stream'

import { gcpBucketClient } from '#core/pdf/bucket/bucket-client'
import { sykInnApiClient } from '#core/services/syk-inn-api/syk-inn-api-client'
import { fhirResourcesService, isResourceError } from '#data-layer/fhir/resources/fhir-resources-service'
import { getReadyClient } from '#data-layer/fhir/smart/ready-client'
import { failSpan, spanServerAsync } from '#lib/otel/server'

export async function GET(
    _: NextRequest,
    { params }: RouteContext<'/fhir/[patientId]/pdf/[sykmeldingId]'>,
): Promise<Response> {
    return spanServerAsync('FHIR.pdf-route', async (span) => {
        const { patientId, sykmeldingId } = await params
        const client = await getReadyClient(patientId)
        if ('error' in client) {
            failSpan(span, `Failed to initialize client: ${client.error}`)
            return new Response('Internal server error', { status: 500 })
        }

        const behandler = await fhirResourcesService.getBehandler(client)
        if (isResourceError(behandler)) {
            failSpan(span, `Failed to get behandler from FHIR: ${behandler.error}`)
            return new Response('Internal server error', { status: 500 })
        }

        /**
         * PDF-mapping uses the syk-inn-api data types directly, and therefore we use the client
         * directly instead of the service.
         */
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
