import * as R from 'remeda'
import { differenceInDays } from 'date-fns'

import {
    SykmeldingDateRange,
    currentSykmeldingIsAktivitetIkkeMulig,
    filterSykmeldingerWithinDaysGap,
    calculateTotalLengthOfSykmeldinger,
    hasAnsweredUtdypendeSporsmal,
} from '@data-layer/common/continuous-sykefravaer-utils'
import { AktivitetsPeriode } from '@features/ny-sykmelding-form/form/types'

export const currentSykmeldingIsPartOfPeriode = (
    currentPerioder: AktivitetsPeriode[],
    previousSykmeldingDateRange?: SykmeldingDateRange[],
): boolean => {
    if (!previousSykmeldingDateRange || previousSykmeldingDateRange.length === 0) {
        // This is the first sykmelding, return true so we can check total length later on
        return true
    }

    const currentFom = R.firstBy(currentPerioder, [(it) => it.periode.fom ?? '', 'desc'])?.periode.fom ?? ''
    const previousLatestTom =
        R.firstBy(previousSykmeldingDateRange ?? [], [(it) => it.latestTom, 'desc'])?.latestTom ?? ''

    if (!currentFom || !previousLatestTom) return false

    const diff = differenceInDays(new Date(currentFom), new Date(previousLatestTom))
    return diff < 16 && diff >= 0
}

export const totalDaysIsMoreThanDays = (sykmeldinger: SykmeldingDateRange[], days: number): boolean => {
    const totalDays = R.pipe(sykmeldinger, filterSykmeldingerWithinDaysGap, calculateTotalLengthOfSykmeldinger)

    return totalDays > days
}

export const shouldShowUke7Sporsmal = (
    perioder: AktivitetsPeriode[],
    previousSykmeldingDateRange?: SykmeldingDateRange[],
): boolean => {
    const DAYS_IN_7_WEEKS = 7 * 7

    const havePreviouslyAnswered = hasAnsweredUtdypendeSporsmal(previousSykmeldingDateRange ?? [])
    if (havePreviouslyAnswered) return false

    if (!currentSykmeldingIsAktivitetIkkeMulig(perioder)) return false

    if (!currentSykmeldingIsPartOfPeriode(perioder, previousSykmeldingDateRange)) return false
    // First check if we're above 7 weeks already
    if (totalDaysIsMoreThanDays(previousSykmeldingDateRange ?? [], DAYS_IN_7_WEEKS)) return true

    // Check if adding current sykmelding will push above 8 weeks
    const currentPeriode: SykmeldingDateRange[] =
        perioder?.length > 0
            ? [
                  {
                      earliestFom: R.firstBy(perioder, [(it) => it.periode.fom ?? '', 'desc'])?.periode.fom ?? '',
                      latestTom: R.firstBy(perioder, [(it) => it.periode.tom ?? '', 'desc'])?.periode.tom ?? '',
                  },
              ]
            : []
    const sykmeldingerIncludingCurrent = [...(previousSykmeldingDateRange ?? []), ...currentPeriode]

    return totalDaysIsMoreThanDays(sykmeldingerIncludingCurrent, DAYS_IN_7_WEEKS + 7)
}
