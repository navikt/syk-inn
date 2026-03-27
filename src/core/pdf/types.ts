import { Diagnose } from '@data-layer/common/diagnose'

/**
 * The PDF generation receives well formatted values and dates, instead of rawdogging SykInnApiSykmelding
 */
export type TypstPdfSykmelding = {
    id: string
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

export type PdfResult = { ok: true; pdf: ArrayBuffer } | { ok: false; error: string }
