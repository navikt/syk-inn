import * as R from 'remeda'
import { differenceInDays } from 'date-fns'

import { SykmeldingFragment } from '@queries'
import { earliestFom, latestTom } from '@data-layer/common/sykmelding-utils'
import { raise } from '@lib/ts'
import { AktivitetsPeriode } from '@features/ny-sykmelding-form/form/types'

export interface SykmeldingDateRange {
    earliestFom: string
    latestTom: string
    utdypendeSporsmal?: UtdypendeSporsmal | null
}

interface UtdypendeSporsmal {
    utfodringerMedArbeid?: string | null
    medisinskOppsummering?: string | null
}

// We need to convert to date ranges first, so we can properly add tilbakedaterte sykmeldinger and filter on gaps later on.
export function mapSykmeldingToDateRanges(sykmeldinger: SykmeldingFragment[]): SykmeldingDateRange[] {
    return R.pipe(
        sykmeldinger,
        R.filter((it) => it.utfall?.result === 'OK'),
        R.map((it) => ({
            earliestFom: earliestFom(it),
            latestTom: latestTom(it),
            utdypendeSporsmal: it.values.__typename === 'SykmeldingFullValues' ? it.values.utdypendeSporsmal : null,
        })),
    )
}

// Only applies to 'uke 7'. There will be other questions for the other special weeks.
export function hasAnsweredUtdypendeSporsmal(sykmeldinger: SykmeldingDateRange[]): boolean {
    return (
        R.pipe(
            sykmeldinger,
            filterSykmeldingerWithinDaysGap,
            R.filter((it) => {
                if (!!it.utdypendeSporsmal?.utfodringerMedArbeid && !!it.utdypendeSporsmal?.medisinskOppsummering) {
                    return true
                }
                return false
            }),
        ).length > 0
    )
}

export function currentSykmeldingIsAktivitetIkkeMulig(perioder: AktivitetsPeriode[]): boolean {
    if (perioder.length === 0) return false

    const latestTomPeriode = R.firstBy(perioder, [(it) => it.periode.tom ?? '', 'desc'])
    return latestTomPeriode?.aktivitet.type === 'AKTIVITET_IKKE_MULIG' ? true : false
}

export function filterSykmeldingerWithinDaysGap(sykmeldinger: SykmeldingDateRange[]): SykmeldingDateRange[] {
    const ISYFO_MAX_DAYS_GAP = 16

    const sortedSykmeldinger = R.sortBy(sykmeldinger, [(it) => it.latestTom, 'desc'])

    const filteredSykmeldinger: SykmeldingDateRange[] = []
    for (const [i, sykmelding] of sortedSykmeldinger.entries()) {
        if (i === 0) {
            filteredSykmeldinger.push(sykmelding)
            continue
        }
        const prev = sortedSykmeldinger[i - 1]
        const prevFom = prev.earliestFom

        const currentTom = sykmelding.latestTom

        const diff = differenceInDays(prevFom, currentTom)
        if (diff < ISYFO_MAX_DAYS_GAP) filteredSykmeldinger.push(sykmelding)
        else break
    }
    return filteredSykmeldinger
}

export function calculateTotalLengthOfSykmeldinger(ranges: SykmeldingDateRange[]): number {
    if (ranges.length === 0) {
        return 0
    }

    // Never assume things are sorted, devs make mistakes
    const sortedRanges = R.sortBy(ranges, [(it) => it.latestTom, 'desc'])

    const fom = R.last(sortedRanges) ?? raise('No last element')
    const tom = R.first(sortedRanges) ?? raise('No first element')

    const days = differenceInDays(tom.latestTom, fom.earliestFom) + 1
    return days
}

export function mergeCurrentAndPreviousSykmeldinger(
    current: SykmeldingFragment[] | undefined,
    previous: SykmeldingFragment[] | undefined,
): SykmeldingFragment[] {
    return R.pipe([current ?? [], previous ?? []], R.flat(), R.sortBy([(it) => latestTom(it), 'desc']))
}
