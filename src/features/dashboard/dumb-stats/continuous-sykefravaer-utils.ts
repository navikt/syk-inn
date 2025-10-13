import * as R from 'remeda'
import { differenceInDays } from 'date-fns'

import { SykmeldingFragment } from '@queries'
import { earliestFom, latestTom } from '@data-layer/common/sykmelding-utils'
import { raise } from '@lib/ts'
import { AktivitetsPeriode } from '@features/ny-sykmelding-form/form'

export interface SykmeldingDateRange {
    earliestFom: string
    latestTom: string
}

export function continiousSykefravaer(sykmeldinger: SykmeldingFragment[]): number {
    if (sykmeldinger.length === 0) {
        return 0
    }

    const ranges = R.pipe(
        sykmeldinger,
        R.map((it) => [earliestFom(it), latestTom(it)] as const),
        R.sortBy([(it) => it[0], 'asc']),
    )

    let startdato = ranges[0][0]
    let previous = startdato
    for (const [fom, tom] of ranges) {
        const diff = differenceInDays(fom, previous)

        if (diff > 16) startdato = fom
        previous = tom
    }

    const lastTom = R.last(ranges)?.[1]
    const diffFromStartdatoToLastTom = lastTom ? differenceInDays(lastTom, startdato) + 1 : 0

    return diffFromStartdatoToLastTom
}

// We need to convert to date ranges first, so we can properly add tilbakedaterte sykmeldinger and filter on gaps later on.
export function mapSykmeldingToDateRanges(sykmeldinger: SykmeldingFragment[]): SykmeldingDateRange[] {
    return R.pipe(
        sykmeldinger,
        R.filter((it) => it.utfall?.result === 'OK'),
        R.map((it) => ({
            earliestFom: earliestFom(it),
            latestTom: latestTom(it),
        })),
    )
}

// Only applies to 'uke 7'. There will be other questions for the other special weeks.
export function hasAnsweredUtdypendeSporsmal(sykmelding: SykmeldingFragment[]): boolean {
    return (
        R.pipe(
            sykmelding,
            R.filter((it) => it.utfall?.result === 'OK'),
            R.filter((it) => {
                if (it.values.__typename === 'SykmeldingValues') {
                    if (
                        !!it.values.utdypendeSporsmal?.utfodringerMedArbeid &&
                        !!it.values.utdypendeSporsmal?.medisinskOppsummering
                    ) {
                        return true
                    }
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
