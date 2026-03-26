import { logger } from '@navikt/next-logger'

import { createTypstSykmelding } from '@core/pdf/typst-service'
import { SykmeldingBuilder } from '@dev/mock-engine/scenarios/SykInnApiSykmeldingBuilder'

export async function GET(): Promise<Response> {
    const body = await createTypstSykmelding(new SykmeldingBuilder().enkelAktivitet().build())
    if (!body.ok) {
        logger.error(`Unable to generate PDF, typst says: ${body.error}`)
        return new Response('Internal server error', { status: 500 })
    }

    return new Response(body.pdf, {
        headers: { 'Content-Type': 'application/pdf' },
        status: 200,
    })
}
