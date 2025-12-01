import * as R from 'remeda'
import { isAfter, isSameDay, sub, subDays } from 'date-fns'

import { raise } from '@lib/ts'

/**
 * The definition of what the offset where Practitioners are able to see the sykmelding without
 * requesting access to more details.
 */
export const PREVIOUS_OFFSET_DAYS = 4

export function byCurrentOrPreviousWithOffset(sykmelding: { values: { aktivitet: { tom: string }[] } }): boolean {
    const latestPeriode = R.firstBy(sykmelding.values.aktivitet, [(it) => it.tom, 'desc'])

    if (!latestPeriode) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }

    const countsAsCurrent = subDays(new Date(), PREVIOUS_OFFSET_DAYS)
    return isSameDay(latestPeriode.tom, countsAsCurrent) || isAfter(latestPeriode.tom, countsAsCurrent)
}

export function isTodayOrInTheFuture(sykmelding: { values: { aktivitet: { tom: string }[] } }): boolean {
    const latestPeriode = R.firstBy(sykmelding.values.aktivitet, [(it) => it.tom, 'desc'])

    if (!latestPeriode) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }

    const now = new Date()
    return isSameDay(latestPeriode.tom, now) || isAfter(latestPeriode.tom, now)
}

export function isWithinWeeksOldSykmelding(
    sykmelding: { values: { aktivitet: { tom: string }[] } },
    weeks: number,
): boolean {
    const latestPeriode = R.firstBy(sykmelding.values.aktivitet, [(it) => it.tom, 'desc'])

    if (!latestPeriode) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }

    const dateWeeksAgo = sub(new Date(), { weeks })
    return isSameDay(latestPeriode.tom, dateWeeksAgo) || isAfter(latestPeriode.tom, dateWeeksAgo)
}

export function earliestFom(sykmelding: { values: { aktivitet: { fom: string }[] } }): string {
    const firstFom = R.firstBy(sykmelding.values.aktivitet, [(it) => it.fom, 'asc'])
    if (!firstFom) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }
    return firstFom.fom
}

export function latestTom(sykmelding: { values: { aktivitet: { tom: string }[] } }): string {
    const latestTom = R.firstBy(sykmelding.values.aktivitet, [(it) => it.tom, 'desc'])
    if (!latestTom) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }
    return latestTom.tom
}
