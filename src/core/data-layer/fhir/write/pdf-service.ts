import { sykInnApiService } from '@core/services/syk-inn-api/syk-inn-api-service'
import { failSpan, spanServerAsync } from '@lib/otel/server'
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
        return pdfBuffer
    })
}
