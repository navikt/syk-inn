import { logger } from '@navikt/next-logger'

import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { failSpan, spanServerAsync } from '@lib/otel/server'
import { gotenbergService } from '@data-layer/pdf/gotenberg-service'
import { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'

export async function generatePdf(
    sykmelding: SykInnApiSykmelding,
    hpr: string,
): Promise<ArrayBuffer | { error: string }> {
    return spanServerAsync('PdfService.generatePdf', async (span) => {
        const pdfBuffer = await sykInnApiService.getSykmeldingPdf(sykmelding.sykmeldingId, hpr)
        if ('errorType' in pdfBuffer) {
            failSpan(span, `Failed fetching PDF: ${pdfBuffer.errorType}`)
            return { error: 'UNABLE_TO_CREATE' }
        }

        // Also generate PDF with gotenberg to compare speed
        await gotenbergService.generateGotenbergPdf(sykmelding).catch((err) => {
            // Ignore error while shadow-generating PDF
            logger.error(new Error('Shadow-gotenberg failed', { cause: err }))
        })

        return pdfBuffer
    })
}
