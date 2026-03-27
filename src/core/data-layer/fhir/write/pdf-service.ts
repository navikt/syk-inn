import { logger } from '@navikt/next-logger'

import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { failSpan, spanServerAsync } from '@lib/otel/server'
import { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { createTypstSykmelding } from '@core/pdf/pdf-service'
import { pdlApiService } from '@core/services/pdl/pdl-api-service'

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

        // Also generate PDF with typst to compare speed
        await spanServerAsync('shadow-typst', async (span) => {
            try {
                const patient = await pdlApiService.getPdlPerson(sykmelding.meta.pasientIdent)
                if ('errorType' in patient) {
                    logger.error(`Failed to fetch PDL patient for typst shadow comparison: ${patient.errorType}`)
                    return
                }

                await createTypstSykmelding(sykmelding, patient)
            } catch (e) {
                failSpan(span, 'Shadow typst PDF generation', e as Error)
            }
        })

        return pdfBuffer
    })
}
