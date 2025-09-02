import { logger as pinoLogger } from '@navikt/next-logger'
import * as z from 'zod'

import {
    SykInnApiRuleOutcome,
    SykInnApiRuleOutcomeSchema,
    SykInnApiSykmelding,
    SykInnApiSykmeldingRedacted,
    SykInnApiSykmeldingRedactedSchema,
    SykInnApiSykmeldingSchema,
} from '@core/services/syk-inn-api/schema/sykmelding'
import { ApiFetchErrors, fetchInternalAPI } from '@core/services/api-fetcher'
import { bundledEnv } from '@lib/env'
import { OpprettSykmeldingPayload, OpprettSykmeldingPayloadSchema } from '@core/services/syk-inn-api/schema/opprett'
import { mockEngineForSession, shouldUseMockEngine } from '@dev/mock-engine'

const logger = pinoLogger.child({}, { msgPrefix: '[API Service]: ' })

export const sykInnApiService = {
    opprettSykmelding: async (
        payload: OpprettSykmeldingPayload,
    ): Promise<SykInnApiSykmelding | SykInnApiRuleOutcome | ApiFetchErrors> => {
        if (shouldUseMockEngine()) {
            logger.warn(
                `Running in ${bundledEnv.runtimeEnv}, submitting send sykmelding values: ${JSON.stringify(payload, null, 2)}`,
            )

            try {
                const mockEngine = await mockEngineForSession()
                return mockEngine.sykInnApi.opprettSykmelding(OpprettSykmeldingPayloadSchema.parse(payload))
            } catch (e) {
                logger.error(new Error(`Sykmelding parse dryrun failed`, { cause: e }))
                throw e
            }
        }

        return fetchInternalAPI({
            api: 'syk-inn-api',
            path: '/api/sykmelding',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(OpprettSykmeldingPayloadSchema.parse(payload)),
            responseSchema: z.union([SykInnApiSykmeldingSchema, SykInnApiRuleOutcomeSchema]),
            responseValidStatus: [422],
        })
    },
    verifySykmelding: async (
        payload: OpprettSykmeldingPayload,
    ): Promise<SykInnApiRuleOutcome | true | ApiFetchErrors> => {
        if (shouldUseMockEngine()) {
            logger.warn(
                `Running in ${bundledEnv.runtimeEnv}, faking rule execution for values: ${JSON.stringify(payload, null, 2)}`,
            )

            // Valid
            return true
        }

        return fetchInternalAPI({
            api: 'syk-inn-api',
            path: '/api/sykmelding/verify',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(OpprettSykmeldingPayloadSchema.parse(payload)),
            responseSchema: z.union([z.literal(true), SykInnApiRuleOutcomeSchema]),
            responseValidStatus: [422],
        })
    },
    getSykmelding: async (
        sykmeldingId: string,
        hpr: string,
    ): Promise<SykInnApiSykmelding | SykInnApiSykmeldingRedacted | ApiFetchErrors> => {
        if (shouldUseMockEngine()) {
            logger.info(`Running in ${bundledEnv.runtimeEnv} environment, returning mocked sykmelding by id data`)

            const mockEngine = await mockEngineForSession()
            return mockEngine.sykInnApi.sykmeldingById(sykmeldingId)
        }

        return fetchInternalAPI({
            api: 'syk-inn-api',
            path: `/api/sykmelding/${sykmeldingId}`,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                HPR: hpr,
            },
            responseSchema: z.union([SykInnApiSykmeldingSchema, SykInnApiSykmeldingRedactedSchema]),
        })
    },
    getSykmeldinger: async (
        pasientIdent: string,
        hpr: string,
    ): Promise<(SykInnApiSykmelding | SykInnApiSykmeldingRedacted)[] | ApiFetchErrors> => {
        if (shouldUseMockEngine()) {
            logger.info(`Running in ${bundledEnv.runtimeEnv} environment, returning mocked sykmelding data`)

            const mockEngine = await mockEngineForSession()
            return mockEngine.sykInnApi.allSykmeldinger()
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
            responseSchema: z.array(z.union([SykInnApiSykmeldingSchema, SykInnApiSykmeldingRedactedSchema])),
        })
    },
    getSykmeldingPdf: async (sykmeldingId: string, hpr: string): Promise<ArrayBuffer | ApiFetchErrors> => {
        if (shouldUseMockEngine()) {
            logger.warn(`Running in ${bundledEnv.runtimeEnv}, returning mocked PDF`)

            const mockEngine = await mockEngineForSession()
            return mockEngine.sykInnApi.getPdf()
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
