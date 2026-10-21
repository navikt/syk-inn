import { logger } from '@navikt/next-logger'

import { gcpBucketClient } from '#core/pdf/bucket/bucket-client'
import { createTypstSykmelding } from '#core/pdf/generation/typst-service'
import { sykInnApiClient } from '#core/services/syk-inn-api/syk-inn-api-client'
import { latestTom } from '#data-layer/common/sykmelding-utils'

/**
 * Temporary development route. Can only be invoked by port forwarding to a container.
 *
 * Backfills all sykmeldinger PDF in the bucket.
 */
export async function POST(): Promise<Response> {
    const allDigital = await sykInnApiClient.getAllPdfableSykmeldinger()

    if ('errorType' in allDigital) {
        return new Response(`Failed to fetch sykmeldinger: ${allDigital.errorType}`, {
            status: 500,
        })
    }

    logger.info(`Fetched ${allDigital.length} sykmeldinger for PDF backfill`)

    const status = {
        successCount: 0,
        pdfGenFailureCount: 0,
        saveFailureCount: 0,
        alreadyExistsCount: 0,
    }

    for (const sykmelding of allDigital) {
        if (await gcpBucketClient.pdfAlreadyExists(sykmelding.sykmeldingId)) {
            logger.info(`PDF already exists for sykmelding ${sykmelding.sykmeldingId}, skipping`)
            status.alreadyExistsCount++
            continue
        }

        const createdPdf = await createTypstSykmelding(sykmelding)
        if (!createdPdf.ok) {
            logger.warn(`Failed to generate PDF for DocumentReference(${sykmelding.sykmeldingId}): ${createdPdf.error}`)
            status.pdfGenFailureCount++
            continue
        }

        try {
            const tom = latestTom(sykmelding)
            await gcpBucketClient.savePdfToBucket(sykmelding.sykmeldingId, createdPdf.pdf, tom)
            status.successCount++
        } catch (e) {
            logger.error(
                new Error(`Failed to save PDF for DocumentReference(${sykmelding.sykmeldingId})`, { cause: e }),
            )
            status.saveFailureCount++
        }
    }

    const body = `Backfill completed. Success: ${status.successCount}
        Already exists: ${status.alreadyExistsCount}
        PDF generation failures: ${status.pdfGenFailureCount}
        Save failures: ${status.saveFailureCount}`.replaceAll('        ', '')
    logger.info(body)
    return new Response(body, { status: 200 })
}
