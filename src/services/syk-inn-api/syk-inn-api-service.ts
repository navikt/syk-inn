import { logger } from '@navikt/next-logger'
import { z } from 'zod/v4'

import { SykInnApiSykmelding, SykInnApiSykmeldingSchema } from '@services/syk-inn-api/schema/sykmelding'
import { ApiFetchErrors, fetchInternalAPI } from '@services/api-fetcher'
import { getServerEnv, isE2E, isLocalOrDemo } from '@utils/env'
import { base64ExamplePdf } from '@navikt/fhir-mock-server/pdfs'
import { createMockSykmelding } from '@services/syk-inn-api/syk-inn-api-mock-data'
import { wait } from '@utils/wait'
import { OpprettSykmeldingPayload, OpprettSykmeldingPayloadSchema } from '@services/syk-inn-api/schema/opprett'

export const sykInnApiService = {
    opprettSykmelding: async (payload: OpprettSykmeldingPayload): Promise<SykInnApiSykmelding | ApiFetchErrors> => {
        if ((isLocalOrDemo || isE2E) && !getServerEnv().useLocalSykInnApi) {
            logger.warn(
                `Is in demo, local or e2e, submitting send sykmelding values ${JSON.stringify(payload, null, 2)}`,
            )

            try {
                // Dry run parse in local dev as well, will throw if it fails
                OpprettSykmeldingPayloadSchema.parse(payload)
            } catch (e) {
                logger.error(`Sykmelding parse dryrun failed: ${e}`)
                throw e
            }

            await wait(500)

            return createMockSykmelding()
        }

        return fetchInternalAPI({
            api: 'syk-inn-api',
            path: '/api/sykmelding',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(OpprettSykmeldingPayloadSchema.parse(payload)),
            responseSchema: SykInnApiSykmeldingSchema,
        })
    },
    getSykmelding: async (sykmeldingId: string, hpr: string): Promise<SykInnApiSykmelding | ApiFetchErrors> => {
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
            responseSchema: SykInnApiSykmeldingSchema,
        })
    },
    getSykmeldinger: async (pasientIdent: string, hpr: string): Promise<SykInnApiSykmelding[] | ApiFetchErrors> => {
        if ((isLocalOrDemo || isE2E) && !getServerEnv().useLocalSykInnApi) {
            logger.info('Running in local or demo environment, returning mocked sykmelding data')
            return [
                createMockSykmelding({
                    sykmeldingId: 'e9369c48-3b8a-4c7f-9097-7c9394947a58',
                }),
                createMockSykmelding({
                    sykmeldingId: 'df567aa4-f694-4857-8e1b-5d14406e9dd6',
                }),
            ]
        }

        return fetchInternalAPI({
            api: 'syk-inn-api',
            path: `/api/sykmelding`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                Ident: pasientIdent,
                HPR: hpr,
            },
            responseSchema: z.array(SykInnApiSykmeldingSchema),
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
