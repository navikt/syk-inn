import { Diagnose } from '@data-layer/common/diagnose'

/**
 * The PDF generation receives well formatted values and dates, instead of rawdogging SykInnApiSykmelding
 */
export type TypstPdfSykmelding = {
    id: string
    title: string
    description: string
    author: string
    meta: {
        mottatt: string
        pasient: {
            ident: string
            navn: string
        }
        behandler: {
            hpr: string
            navn: string
        }
        legekontor: {
            orgnr: string | null
            tlf: string | null
        }
    }
    values: {
        arbeidsgiver: string | null
        annenFravarsgrunn: string | null
        andreSporsmal: string[] | null
        meldinger: {
            tilNav: string | null
            tilArbeidsgiver: string | null
        }
        pasientenSkalSkjermes: boolean
        diagnose: {
            hoved: Diagnose | null
            bi: Diagnose[]
        }
        aktivitet: {
            periode: string
            type: string
            details: string[]
        }[]
        utdypendeSporsmal: {
            text: string
            answer: string
        }[]
    }
}

export type PdfOK = { ok: true; pdf: ArrayBuffer }
export type PdfError = { ok: false; error: string }

export type PdfResult = PdfOK | PdfError
