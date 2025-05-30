import { logger } from '@navikt/next-logger'

import {
    ExistingSykmelding,
    ExistingSykmeldingSchema,
    NySykmelding,
    NySykmeldingSchema,
} from '@services/syk-inn-api/SykInnApiSchema'
import { ApiFetchErrors, fetchInternalAPI } from '@services/api-fetcher'
import { isE2E, isLocalOrDemo } from '@utils/env'
import { base64ExamplePdf } from '@navikt/fhir-mock-server/pdfs'
import { ICD10_OID, ICPC2_OID } from '@utils/oid'

type NySykmeldingPayload = {
    pasientFnr: string
    sykmelderHpr: string
    sykmelding: {
        hoveddiagnose: {
            system: ICD10_OID | ICPC2_OID
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
    legekontorOrgnr: string
}

export const sykInnApiService = {
    createNewSykmelding: async (payload: NySykmeldingPayload): Promise<NySykmelding | ApiFetchErrors> =>
        fetchInternalAPI({
            api: 'syk-inn-api',
            path: '/api/sykmelding',
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
            path: `/api/sykmelding/${sykmeldingId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                HPR: hpr,
            },
            responseSchema: ExistingSykmeldingSchema,
        }),
    getSykmeldingPdf: async (sykmeldingId: string, hpr: string): Promise<ArrayBuffer | ApiFetchErrors> => {
        if (isLocalOrDemo || isE2E) {
            logger.warn('Is in demo, local or e2e, returning mocked PDF')

            const response = new Response(Buffer.from(base64ExamplePdf), {
                headers: { 'Content-Type': 'application/pdf' },
                status: 200,
            })

            return await response.arrayBuffer()
        }

        return await fetchInternalAPI({
            api: 'syk-inn-api',
            path: `/api/sykmelding/${sykmeldingId}/pdf`,
            method: 'GET',
            headers: {
                Accept: 'application/pdf',
                HPR: hpr,
            },
            responseSchema: 'ArrayBuffer',
        })
    },
}
