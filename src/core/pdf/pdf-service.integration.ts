import { describe, test, expect } from 'vitest'
import { PDFParse } from 'pdf-parse'
import * as R from 'remeda'

import { createTypstSykmelding } from '@core/pdf/pdf-service'
import { SykmeldingBuilder } from '@dev/mock-engine/scenarios/SykInnApiSykmeldingBuilder'
import { PdfOK, PdfResult } from '@core/pdf/types'

describe('typst CLI integration', () => {
    test('should work', async () => {
        const chonkySykmelding = new SykmeldingBuilder({ offset: -70 })
            .enkelAktivitet({ offset: 0, days: 7 })
            .enkelAktivitet({ offset: 8, days: 14 })
            .uke17Answered()
            .build()

        const typst = await createTypstSykmelding(chonkySykmelding)
        expectPdfOk(typst)

        const pdf = new PDFParse({ data: typst.pdf })
        const { info } = await pdf.getInfo()

        expect(info.Title).toEqual('Innsendt sykmelding')
        expect(info.Author).toEqual('Kari Nordmann Legesson (123456)')
        expect(info.Language).toEqual('nb')
    })

    test('generate 100 PDFs', async () => {
        const chonkySykmelding = new SykmeldingBuilder({ offset: -70 })
            .enkelAktivitet({ offset: 0, days: 7 })
            .enkelAktivitet({ offset: 8, days: 14 })
            .uke17Answered()
            .build()

        /**
         * Relying on OS-level multi-threading, exec'ing 100 PDF generations at the same time should be fine
         */
        expect.assertions(100)
        await Promise.all(
            R.range(0, 100).map(async () => {
                const typst = await createTypstSykmelding(chonkySykmelding)
                expectPdfOk(typst)

                const pdf = new PDFParse({ data: typst.pdf })
                const { info } = await pdf.getInfo()

                expect(info.Title).toEqual('Innsendt sykmelding')
            }),
        )
    })

    // eslint-disable-next-line vitest/expect-expect
    test('Generating your PDF should work', async () => {
        // TODO: Previous syk-inn-api integration test, pdf is no longer part of API
        /*
        const payload = createFullOpprettSykmeldingPayload()
        const opprettResult = await sykInnApiService.opprettSykmelding(payload)

        if ('errorType' in opprettResult) {
            throw Error(`Opprett failed, expected OK but had error: ${opprettResult.errorType}`)
        }

        const pdf = await sykInnApiService.getSykmeldingPdf(opprettResult.sykmeldingId, payload.meta.sykmelderHpr)

        if ('errorType' in pdf) {
            throw Error(`Fetch PDF by ID failed, expected OK but had error: ${pdf.errorType}`)
        }

        expect(pdf.byteLength).toBeGreaterThan(1000)
         */
    }, 10_000)

    // eslint-disable-next-line vitest/expect-expect
    test('Generating PDF that does not belong to HPR should not work', async () => {
        // TODO: Previous syk-inn-api integration test, pdf is no longer part of API
        /*
        const payload = createFullOpprettSykmeldingPayload()
        const opprettResult = await sykInnApiService.opprettSykmelding(payload)

        if ('errorType' in opprettResult) {
            throw Error(`Opprett failed, expected OK but had error: ${opprettResult.errorType}`)
        }

        const pdf = await sykInnApiService.getSykmeldingPdf(opprettResult.sykmeldingId, 'wrong-hpr')

        if (!('errorType' in pdf)) {
            throw Error(`Expected error when trying to fetch PDF with wrong HPR, but got PDF of size ${pdf.byteLength}`)
        }

        expect(pdf.errorType).toEqual('SYKMELDING_PDF_FORBIDDEN')
        */
    })
})

function expectPdfOk(result: PdfResult): asserts result is PdfOK {
    if (result.ok) return

    expect.fail(`Failed to generate PDF, cause: ${result.error}`)
}
