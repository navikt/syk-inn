import {
    ExistingSykmelding,
    ExistingSykmeldingSchema,
    NySykmelding,
    NySykmeldingSchema,
    SykmeldingPdf,
    SykmeldingPdfSchema,
} from '@services/syk-inn-api/SykInnApiSchema'
import { ApiFetchErrors, fetchInternalAPI } from '@services/api-fetcher'

type NySykmeldingPayload = {
    pasientFnr: string
    sykmelderHpr: string
    sykmelding: {
        hoveddiagnose: {
            system: 'ICD10' | 'ICPC2'
            code: string
        }
        aktivitet:
            | {
                  type: 'AKTIVITET_IKKE_MULIG'
                  fom: string
                  tom: string
              }
            | {
                  type: 'GRADERT'
                  grad: number
                  fom: string
                  tom: string
              }
    }
}

export const sykInnApiService = {
    createNewSykmelding: async (payload: NySykmeldingPayload): Promise<NySykmelding | ApiFetchErrors> =>
        fetchInternalAPI({
            api: 'syk-inn-api',
            path: '/api/v1/sykmelding/create',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            responseSchema: NySykmeldingSchema,
        }),
    getSykmelding: async (sykmeldingId: string, hpr: string): Promise<ExistingSykmelding | ApiFetchErrors> =>
        fetchInternalAPI({
            api: 'syk-inn-api',
            path: `/api/v1/sykmelding/${sykmeldingId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                HPR: hpr,
            },
            responseSchema: ExistingSykmeldingSchema,
        }),
    getTidligereSykmeldinger: async (ident: string): Promise<ExistingSykmelding[] | ApiFetchErrors> =>
        fetchInternalAPI({
            api: 'syk-inn-api',
            path: `/api/v1/sykmelding`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Ident: ident,
            },
            responseSchema: ExistingSykmeldingSchema.array(),
        }),
    getSykmeldingPdf: async (sykmeldingId: string): Promise<SykmeldingPdf | ApiFetchErrors> =>
        fetchInternalAPI({
            api: 'syk-inn-api',
            path: `/api/v1/sykmelding/${sykmeldingId}/pdf`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                sykmeldingId: sykmeldingId,
            },
            responseSchema: SykmeldingPdfSchema,
        }),
}
