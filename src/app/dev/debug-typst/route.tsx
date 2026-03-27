import { logger } from '@navikt/next-logger'

import { createTypstSykmelding } from '@core/pdf/pdf-service'
import { SykmeldingBuilder } from '@dev/mock-engine/scenarios/SykInnApiSykmeldingBuilder'
import { pdlApiService } from '@core/services/pdl/pdl-api-service'

export async function GET(): Promise<Response> {
    const chonkySykmelding = new SykmeldingBuilder({ offset: -70 })
        .enkelAktivitet({ offset: 0, days: 7 })
        .enkelAktivitet({ offset: 8, days: 14 })
        .uke17Answered()
        .build()

    const mockPerson = await pdlApiService.getPdlPerson('12345678910')
    if ('errorType' in mockPerson) {
        logger.error(`Failed to fetch mock person: ${mockPerson.errorType}`)
        return new Response('Internal server error', { status: 500 })
    }

    const body = await createTypstSykmelding(chonkySykmelding, mockPerson)
    if (!body.ok) {
        logger.error(`Unable to generate PDF, typst says: ${body.error}`)
        return new Response('Internal server error', { status: 500 })
    }

    return new Response(body.pdf, {
        headers: { 'Content-Type': 'application/pdf' },
        status: 200,
    })
}
