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
                        it.values.utdypendeSporsmal?.utfodringerMedArbeid!! &&
                        it.values.utdypendeSporsmal?.medisinskOppsummering!!
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

export function filterSykmeldingerWithinDaysGap2(sykmeldinger: SykmeldingDateRange[]): SykmeldingDateRange[] {
    const ISYFO_MAX_DAYS_GAP = 16

    return R.pipe(
        sykmeldinger,
        R.sortBy([(it) => it.latestTom, 'desc']),
        R.filter((value, index, array) => {
            if (index === 0) return true
            const prev = array[index - 1]

            const prevFom = prev.earliestFom
            const currentTom = value.latestTom
            const diff = differenceInDays(prevFom, currentTom)
            return diff < ISYFO_MAX_DAYS_GAP
        }),
    )
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
    // TODO: Sjekke på latestTom ikke første verdi i array
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

    if (diffFromLastSykmeldingToCurrent > 16) {
        return false
    }

    return continiousDays + diffFromLastSykmeldingToCurrent + lengthOfCurrentSykmelding > DAYS_IN_7_WEEKS + 7
}

// TODO for fredag
/*
 * ✅ Flytte datafetching utenfor form komponent. Må mappes om til array med ealiestFom og latestTom
 * Ikke gjøre filtrering på perioder i første sortering, siden sykmeldinger kan tilbakedateres og påvirke gaps som ellers ville blitt filtrert ut
 * Egen funksjon som tar med nåværende periode, regner ut gaps og returnerer om det skal vises eller ikke
 * Kun se på 100% sykmelding for perioden med latestTom i nåværende sykmelding for å avgjøre om spørsmålene skal vises
 * Utvide med funksjonalitet for visning av de andre ukesspørsmålene
 * ✅ Ikke vise spørsmål dersom tidligere ukesspørsmål er besvart
 * ✅ Playwright tester
 */
