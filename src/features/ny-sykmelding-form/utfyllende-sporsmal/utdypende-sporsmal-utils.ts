import * as R from 'remeda'
import { differenceInDays } from 'date-fns'

import {
    SykmeldingDateRange,
    currentSykmeldingIsAktivitetIkkeMulig,
} from '@data-layer/common/continuous-sykefravaer-utils'
import { AktivitetsPeriode } from '@features/ny-sykmelding-form/form/types'
import { raise } from '@lib/ts'
import { UtdypendeOpplysningerHint } from '@data-layer/graphql/generated/resolvers.generated'

const ISYFO_MAX_DAYS_GAP = 16

const currentSykmeldingIsPartOfPeriode = (
    currentPerioder: AktivitetsPeriode[],
    utdypendeSporsmal?: { days: number; latestTom?: string | null } | null,
): boolean => {
    if (!utdypendeSporsmal || utdypendeSporsmal.days <= 0) {
        // This is the first sykmelding, return true so we can check total length later on
        return true
    }

    const currentFom = R.firstBy(currentPerioder, [(it) => it.periode.fom ?? '', 'desc'])?.periode.fom ?? ''

    if (!currentFom || !utdypendeSporsmal?.latestTom) return false

    const diff = differenceInDays(new Date(currentFom), new Date(utdypendeSporsmal.latestTom))
    return diff < ISYFO_MAX_DAYS_GAP
}

export const totalDaysIsMoreThanDays = (
    utdypendeSporsmal: { days: number; latestTom?: string | null },
    currentSykmeldingRange: SykmeldingDateRange[],
    days: number,
): boolean => {
    // Calculate diff between latestTom and currentSykmeldingRaange.latestTom
    const currentLatestTom =
        R.firstBy(currentSykmeldingRange, [(it) => it.latestTom, 'desc'])?.latestTom ?? raise('No latestTom found')
    const currentFom =
        R.firstBy(currentSykmeldingRange, [(it) => it.earliestFom, 'asc'])?.earliestFom ?? raise('No earliestFom found')

    const previousDate = utdypendeSporsmal.latestTom ?? currentFom

    const totalDays = differenceInDays(currentLatestTom, previousDate) + 1 + utdypendeSporsmal.days

    return totalDays > days
}

export const satisfiesGeneralConditions = (
    perioder: AktivitetsPeriode[],
    utdypendeSporsmal: UtdypendeOpplysningerHint,
    daysForPeriode: number,
): boolean => {
    if (!currentSykmeldingIsPartOfPeriode(perioder, utdypendeSporsmal)) return false

    if (utdypendeSporsmal && utdypendeSporsmal.days > daysForPeriode) return true

    const currentPeriode: SykmeldingDateRange[] =
        perioder?.length > 0
            ? [
                  {
                      earliestFom: R.firstBy(perioder, [(it) => it.periode.fom ?? '', 'desc'])?.periode.fom ?? '',
                      latestTom: R.firstBy(perioder, [(it) => it.periode.tom ?? '', 'desc'])?.periode.tom ?? '',
                  },
              ]
            : []
    return totalDaysIsMoreThanDays(utdypendeSporsmal, currentPeriode, daysForPeriode + 7)
}

export const shouldShowUke7Sporsmal = (
    perioder: AktivitetsPeriode[],
    utdypendeSporsmal: UtdypendeOpplysningerHint,
): boolean => {
    const DAYS_IN_7_WEEKS = 7 * 7

    if (
        utdypendeSporsmal.previouslyAnsweredSporsmal.includes('UTFORDRINGER_MED_ARBEID') &&
        utdypendeSporsmal.previouslyAnsweredSporsmal.includes('MEDISINSK_OPPSUMMERING')
    ) {
        return false
    }

    if (!currentSykmeldingIsAktivitetIkkeMulig(perioder)) return false

    return satisfiesGeneralConditions(perioder, utdypendeSporsmal, DAYS_IN_7_WEEKS)
}

export const shouldShowUke17Sporsmal = (
    perioder: AktivitetsPeriode[],
    utdypendeSporsmal: UtdypendeOpplysningerHint,
): boolean => {
    const DAYS_IN_17_WEEKS = 17 * 7

    if (
        utdypendeSporsmal.previouslyAnsweredSporsmal.includes('BEHANDLING_OG_FREMTIDIG_ARBEID') &&
        utdypendeSporsmal.previouslyAnsweredSporsmal.includes('UAVKLARTE_FORHOLD')
    ) {
        return false
    }

    return satisfiesGeneralConditions(perioder, utdypendeSporsmal, DAYS_IN_17_WEEKS)
}

export const shouldShowUke39Sporsmal = (
    perioder: AktivitetsPeriode[],
    utdypendeSporsmal: UtdypendeOpplysningerHint,
): boolean => {
    const DAYS_IN_39_WEEKS = 39 * 7

    if (
        utdypendeSporsmal.previouslyAnsweredSporsmal.includes('FORVENTET_HELSETILSTAND_UTVIKLING') &&
        utdypendeSporsmal.previouslyAnsweredSporsmal.includes('MEDISINSKE_HENSYN')
    ) {
        return false
    }

    return satisfiesGeneralConditions(perioder, utdypendeSporsmal, DAYS_IN_39_WEEKS)
}
