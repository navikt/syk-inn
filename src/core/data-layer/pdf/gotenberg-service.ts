import { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { failSpan, spanServerAsync } from '@lib/otel/server'
import { pdlApiService } from '@core/services/pdl/pdl-api-service'
import { PdlPerson } from '@core/services/pdl/pdl-api-schema'
import { getSimpleSykmeldingDescription } from '@data-layer/common/sykmelding-utils'

import { createBodyHtml } from './html/content'
import { createFooterHtml, createHeaderHtml } from './html/fixed'
import { getConvertUrl, Gotenberg } from './gotenberg-config'

const CONVERT_URL = getConvertUrl()

export const gotenbergService = {
    generateGotenbergPdf: async (sykmelding: SykInnApiSykmelding): Promise<ArrayBuffer> =>
        spanServerAsync('GotenbergService.generatePdf', async (span) => {
            span.setAttributes({ 'sykmelding.id': sykmelding.sykmeldingId })

            const person = await pdlApiService.getPdlPerson(sykmelding.meta.pasientIdent)
            if ('errorType' in person) {
                throw new Error(`Unable to get person in PDL, cause: ${person.errorType}`)
            }

            const data = baseFormData()
            await generateHTML(data, sykmelding, person)
            await generateMetadata(data, sykmelding)

            const response = await fetch(CONVERT_URL, { method: 'POST', body: data })
            if (!response.ok) {
                failSpan.andThrow(
                    span,
                    'Gotenberg request failed',
                    new Error(`Gotenberg request failed with status ${response.status} ${response.statusText}`),
                )
            }

            return await response.arrayBuffer()
        }),
    debugGotenbergPdfHtml: async (sykmelding: SykInnApiSykmelding): Promise<string> => {
        const person = await pdlApiService.getPdlPerson(sykmelding.meta.pasientIdent)
        if ('errorType' in person) {
            throw new Error(`Unable to get person in PDL, cause: ${person.errorType}`)
        }

        return await createBodyHtml(sykmelding, person)
    },
}

function baseFormData(): FormData {
    const formdata = new FormData()
    formdata.append('paperWidth', '210mm')
    formdata.append('paperHeight', '297mm')
    formdata.append('marginTop', '26mm')
    formdata.append('pdfa', 'PDF/A-3b')
    formdata.append('pdfua', 'true')
    return formdata
}

async function generateHTML(data: FormData, sykmelding: SykInnApiSykmelding, person: PdlPerson): Promise<void> {
    await spanServerAsync('GotenbergService.generatePdf.generateHTML', async () => {
        data.append('body', toHtmlBlob(await createBodyHtml(sykmelding, person)), Gotenberg.BODY)
        data.append('header', toHtmlBlob(await createHeaderHtml()), Gotenberg.HEADER)
        data.append('footer', toHtmlBlob(await createFooterHtml({ id: sykmelding.sykmeldingId })), Gotenberg.FOOTER)
    })
}

async function generateMetadata(data: FormData, sykmelding: SykInnApiSykmelding): Promise<void> {
    await spanServerAsync('GotenbergService.generatePdf.generateMetadata', async () => {
        /**
         * Valid metadata fields are described here: https://exiftool.org/TagNames/XMP.html#pdf
         */
        type ExpectedMetadata = {
            Subject: string
            Author: string
            Title: string
            CreationDate: string
        }

        const value: ExpectedMetadata = {
            Title: 'Innsendt Sykmelding',
            Subject: getSimpleSykmeldingDescription(sykmelding.values.aktivitet),
            CreationDate: sykmelding.meta.mottatt,
            Author: 'syk-inn (FHIR)',
        }

        data.append('metadata', JSON.stringify(value))
    })
}

function toHtmlBlob(html: string): Blob {
    return new Blob([html], { type: 'text/html' })
}
