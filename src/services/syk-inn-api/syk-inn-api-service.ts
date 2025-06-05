import { logger } from '@navikt/next-logger'

import {
    ExistingSykmelding,
    ExistingSykmeldingSchema,
    NySykmelding,
    NySykmeldingSchema,
} from '@services/syk-inn-api/syk-inn-api-schema'
import { ApiFetchErrors, fetchInternalAPI } from '@services/api-fetcher'
import { getServerEnv, isE2E, isLocalOrDemo } from '@utils/env'
import { base64ExamplePdf } from '@navikt/fhir-mock-server/pdfs'
import { ICD10_OID, ICPC2_OID } from '@utils/oid'
import { createMockSykmelding } from '@services/syk-inn-api/syk-inn-api-mock-data'
import { wait } from '@utils/wait'

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
    createNewSykmelding: async (payload: NySykmeldingPayload): Promise<NySykmelding | ApiFetchErrors> => {
        if ((isLocalOrDemo || isE2E) && !getServerEnv().useLocalSykInnApi) {
            logger.warn(
                `Is in demo, local or e2e, submitting send sykmelding values ${JSON.stringify(payload, null, 2)}`,
            )

            await wait(500)

            return { sykmeldingId: 'ba78036d-b63c-4c5a-b3d5-b1d1f812da8d' }
        }

        return fetchInternalAPI({
            api: 'syk-inn-api',
            path: '/api/sykmelding',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
            responseSchema: NySykmeldingSchema,
        })
    },
    getSykmelding: async (sykmeldingId: string, hpr: string): Promise<ExistingSykmelding | ApiFetchErrors> => {
        if ((isLocalOrDemo || isE2E) && !getServerEnv().useLocalSykInnApi) {
            logger.info('Running in local or demo environment, returning mocked sykmelding data')
            return createMockSykmelding()
        }

        return fetchInternalAPI({
            api: 'syk-inn-api',
            path: `/api/sykmelding/${sykmeldingId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                HPR: hpr,
            },
            responseSchema: ExistingSykmeldingSchema,
        })
    },
    getSykmeldingPdf: async (sykmeldingId: string, hpr: string): Promise<ArrayBuffer | ApiFetchErrors> => {
        if ((isLocalOrDemo || isE2E) && !getServerEnv().useLocalSykInnApi) {
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
