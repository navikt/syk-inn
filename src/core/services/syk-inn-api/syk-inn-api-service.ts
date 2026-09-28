import { getFlag, getUserToggles } from '#core/toggles/unleash'
import metrics from '#lib/prometheus/metrics'
import { raise } from '#lib/ts'
import { RuleOutcome, Sykmelding, SykmeldingFull } from '#resolvers'

import { registerDiagnoseMetrics } from './metrics/diagnose-metrics'
import { OpprettSykmeldingMeta, OpprettSykmeldingPayload, OpprettSykmeldingValues } from './schema/opprett'
import { sykInnApiClient } from './syk-inn-api-client'
import {
    sykInnApiSykmeldingRedactedToResolverSykmelding,
    sykInnApiSykmeldingToResolverSykmelding,
    sykInnApiSykmeldingToResolverSykmeldingFull,
} from './syk-inn-api-utils'

export const sykInnApiService = {
    /**
     * Fetches access-controlled sykmeldinger (the behandler should have the rights to see them).
     *
     * If toggled on, redacted sykmeldinger will be mapped down, if not they will be mapped out (null).
     *
     * Normal mapping reduces the visibily to a 'light' sykmelding if applicable.
     */
    async getSykmelding(
        sykmeldingId: string,
        behandlerHpr: string,
    ): Promise<Sykmelding | { error: 'NO_ACCESS' } | { error: 'API_ERROR'; cause: string }> {
        const sykmelding = await sykInnApiClient.getSykmelding(sykmeldingId, behandlerHpr)
        if ('errorType' in sykmelding) {
            return { error: 'API_ERROR', cause: sykmelding.errorType }
        }

        if (sykmelding.kind === 'redacted') {
            const showRedactedFlag = getFlag('SYK_INN_SHOW_REDACTED', await getUserToggles(behandlerHpr))
            if (!showRedactedFlag) return { error: 'NO_ACCESS' }

            return sykInnApiSykmeldingRedactedToResolverSykmelding(sykmelding)
        }

        return sykInnApiSykmeldingToResolverSykmelding(sykmelding)
    },
    /**
     * Fetches all sykmeldinger for a given patient and behandler. The behandler should have the rights to see them.
     *
     * If toggled on, redacted sykmeldinger will be mapped down, if not they will be filtered out.
     *
     * Normal mapping reduces the visibily to a 'light' sykmelding if applicable.
     */
    async getSykmeldinger(
        pasientIdent: string,
        behandlerHpr: string,
    ): Promise<Sykmelding[] | { error: 'API_ERROR'; cause: string }> {
        const sykInnSykmeldinger = await sykInnApiClient.getSykmeldinger(pasientIdent, behandlerHpr)
        if ('errorType' in sykInnSykmeldinger) {
            return { error: 'API_ERROR', cause: sykInnSykmeldinger.errorType }
        }

        /**
         * Only return kind='redacted' sykmeldinger if SYK_INN_SHOW_REDACTED is enabled for this user
         */
        const showRedactedFlag = getFlag('SYK_INN_SHOW_REDACTED', await getUserToggles(behandlerHpr))
        const sykmeldinger = showRedactedFlag
            ? sykInnSykmeldinger
            : sykInnSykmeldinger.filter((it) => it.kind !== 'redacted')

        /**
         * Redacted are already filtered out if the feature is off.
         */
        const mappedSykmeldinger = sykmeldinger.map((it) =>
            it.kind === 'redacted'
                ? sykInnApiSykmeldingRedactedToResolverSykmelding(it)
                : sykInnApiSykmeldingToResolverSykmelding(it),
        )

        return mappedSykmeldinger
    },

    async opprettSykmelding(
        meta: OpprettSykmeldingMeta,
        values: OpprettSykmeldingValues,
        mode: { submitId: string; force: boolean },
    ): Promise<SykmeldingFull | RuleOutcome | { error: 'API_ERROR'; cause: string } | { error: 'PATIENT_NOT_IN_PDL' }> {
        const payload: OpprettSykmeldingPayload = {
            submitId: mode.submitId,
            meta,
            values,
        }

        if (!mode.force) {
            // When not forcing, we first verify the sykmelding
            const verifyResult = await sykInnApiClient.verifySykmelding(payload)
            if ('errorType' in verifyResult) {
                return { error: 'API_ERROR', cause: verifyResult.errorType }
            }

            if ('status' in verifyResult && verifyResult.status !== 'OK') {
                // There are rule outcomes, short circuit and return them
                return {
                    status: verifyResult.status,
                    rule: verifyResult.rule ?? raise(`Rule outcome ${verifyResult.status} without rule`),
                    message: verifyResult.message ?? raise(`Rule outcome ${verifyResult.status} without message`),
                } satisfies RuleOutcome
            }

            if (typeof verifyResult === 'object' && verifyResult.message === 'Person does not exist') {
                return { error: 'PATIENT_NOT_IN_PDL' }
            }

            // No rule hits, proceed to create the sykmelding
        }

        const result = await sykInnApiClient.opprettSykmelding(payload)
        if ('errorType' in result) {
            return { error: 'API_ERROR', cause: result.errorType }
        }

        metrics.createdSykmelding.inc({ hpr: meta.sykmelderHpr, outcome: result.utfall.result }, 1)
        registerDiagnoseMetrics(values, meta.source.includes('FHIR') ? 'fhir' : 'helseid')

        return sykInnApiSykmeldingToResolverSykmeldingFull(result)
    },
}
