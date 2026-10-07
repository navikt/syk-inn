import { failSpan, spanServerAsync } from '#lib/otel/server'

import { latestTom } from '../data-layer/common/sykmelding-utils'
import { SykInnApiSykmelding } from '../services/syk-inn-api/schema/sykmelding'

import { gcpBucketClient } from './bucket/bucket-client'
import { createTypstSykmelding } from './generation/typst-service'

export async function getOrCreatePdf(sykmelding: SykInnApiSykmelding): Promise<
    | { ok: true; pdf: ArrayBuffer }
    | {
          ok: false
          error: 'UNABLE_TO_CREATE' | 'UNABLE_TO_VERIFY_IF_EXISTS' | 'GCP_ERROR'
      }
> {
    return spanServerAsync('pdf-service.getOrCreatePdf', async (span) => {
        const sykmeldingId = sykmelding.sykmeldingId

        try {
            if (await gcpBucketClient.pdfAlreadyExists(sykmeldingId)) {
                const bucketPdf = await gcpBucketClient.getPdfFromBucket(sykmeldingId)

                const pdf = new ArrayBuffer(bucketPdf.byteLength)
                new Uint8Array(pdf).set(bucketPdf)

                return { ok: true, pdf }
            }
        } catch (e) {
            failSpan(
                span,
                'GCP check or read failed',
                e instanceof Error ? e : new Error('Unknown error', { cause: e }),
            )
            return { ok: false, error: 'GCP_ERROR' }
        }

        const createdPdf = await createTypstSykmelding(sykmelding)
        if (!createdPdf.ok) {
            failSpan(span, `Failed to generate PDF for DocumentReference(${sykmeldingId}): ${createdPdf.error}`)
            return { ok: false, error: 'UNABLE_TO_CREATE' }
        }

        try {
            const tom = latestTom(sykmelding)
            await gcpBucketClient.savePdfToBucket(sykmeldingId, createdPdf.pdf, tom)
        } catch (e) {
            failSpan(span, 'GCP save failed', e)
            return { ok: false, error: 'GCP_ERROR' }
        }

        return { ok: true, pdf: createdPdf.pdf }
    })
}
