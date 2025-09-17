import * as R from 'remeda'
import { differenceInDays } from 'date-fns'

import { SykmeldingFragment } from '@queries'
import { earliestFom, latestTom } from '@data-layer/common/sykmelding-utils'
import { raise } from '@lib/ts'
import { AktivitetsPeriode } from '@features/ny-sykmelding-form/form'

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

// Assuming sort in desc order by latestTom, assuming there's no weird overlapping sykmeldinger etc
export function filterSykmeldingerWithinDaysGap(sykmeldinger: SykmeldingFragment[]): SykmeldingFragment[] {
    // TODO double check values from differenceindays etc
    const ISYFO_MAX_DAYS_GAP = 16

    return R.filter(sykmeldinger, (value, index, array) => {
        if (index === 0) return true
        const prev = array[index - 1]

        const prevFom = earliestFom(prev)
        const currentTom = latestTom(value)
        const diff = differenceInDays(prevFom, currentTom)
        return diff < ISYFO_MAX_DAYS_GAP
    })
}

// Grand function to sort and filter all the stuff
export function sortAndFilter(sykmeldinger: SykmeldingFragment[]): SykmeldingFragment[] {
    return R.pipe(
        sykmeldinger,
        R.filter((it) => it.utfall?.result === 'OK'),
        R.sortBy([(it) => latestTom(it), 'desc']),
        filterSykmeldingerWithinDaysGap,
    )
}

export function calculateContinuousSykefravaer(sykmeldinger: SykmeldingFragment[]): number {
    if (sykmeldinger.length === 0) {
        return 0
    }
    const fom = earliestFom(R.last(sykmeldinger) ?? raise('No first element'))
    const tom = latestTom(R.first(sykmeldinger) ?? raise('No last element'))

    const days = differenceInDays(tom, fom) + 1
    return days
}

export function calculateLengthOfCurrentSykmelding(perioder: AktivitetsPeriode[]): number {
    if (perioder.length === 0) {
        return 0
    }

    const firstFom = R.firstBy(perioder, [(it) => it.periode.fom ?? '', 'desc'])
    const latestTom = R.firstBy(perioder, [(it) => it.periode.tom ?? '', 'desc'])

    if (firstFom?.periode.fom && latestTom?.periode.tom) {
        return differenceInDays(latestTom.periode.tom, firstFom?.periode.fom) + 1
    }

    return 0
}

export function shouldShowUtfyllendeSporsmal(
    sykmeldinger: SykmeldingFragment[],
    perioder: AktivitetsPeriode[],
): boolean {
    const DAYS_IN_7_WEEKS = 7 * 7

    const continiousDays = calculateContinuousSykefravaer(sykmeldinger)

    const newestSykmelding = sykmeldinger[sykmeldinger.length - 1]
    if (newestSykmelding?.values.aktivitet[0].type != 'AKTIVITET_IKKE_MULIG') {
        return false
    }

    if (continiousDays > DAYS_IN_7_WEEKS) {
        return true
    }

    const lengthOfCurrentSykmelding = calculateLengthOfCurrentSykmelding(perioder)
    if (lengthOfCurrentSykmelding === 0) {
        return false
    }

    const lastTom = latestTom(R.first(sykmeldinger) ?? raise('No last element'))
    const firstFomCurrent = R.firstBy(perioder, [(it) => it.periode.fom ?? raise('No first element'), 'desc'])

    const diffFromLastSykmeldingToCurrent = differenceInDays(
        lastTom,
        firstFomCurrent?.periode.fom ?? raise('No first element'),
    )

    return continiousDays + diffFromLastSykmeldingToCurrent + lengthOfCurrentSykmelding > DAYS_IN_7_WEEKS + 7
}
