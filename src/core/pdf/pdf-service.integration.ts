import { describe, test, expect } from 'vitest'
import { PDFParse } from 'pdf-parse'

import { createTypstSykmelding } from '@core/pdf/pdf-service'
import { SykmeldingBuilder } from '@dev/mock-engine/scenarios/SykInnApiSykmeldingBuilder'
import { PdlPerson } from '@core/services/pdl/pdl-api-schema'
import { PdfOK, PdfResult } from '@core/pdf/types'

describe('typst CLI integration', () => {
    test('should work', async () => {
        const chonkySykmelding = new SykmeldingBuilder({ offset: -70 })
            .enkelAktivitet({ offset: 0, days: 7 })
            .enkelAktivitet({ offset: 8, days: 14 })
            .uke17Answered()
            .build()

        const mockPerson: PdlPerson = {
            navn: {
                fornavn: 'Test',
                mellomnavn: null,
                etternavn: 'Person',
            },
            foedselsdato: '1990-01-01',
            identer: [
                {
                    ident: '12345678910',
                    gruppe: 'FOLKEREGISTERIDENT',
                    historisk: false,
                },
            ],
        }

        const typst = await createTypstSykmelding(chonkySykmelding, mockPerson)
        expectPdfOk(typst)

        const pdf = new PDFParse({ data: typst.pdf })
        const { info } = await pdf.getInfo()

        expect(info.Title).toEqual('Innsendt sykmelding')
        expect(info.Author).toEqual('Kari Nordmann Lege (123456)')
        expect(info.Language).toEqual('nb')
    })
})

function expectPdfOk(result: PdfResult): asserts result is PdfOK {
    if (result.ok) return

    expect.fail(`Failed to generate PDF, cause: ${result.error}`)
}
