import { describe, expect, test } from 'vitest'

import { AktivitetsPeriode } from '@features/ny-sykmelding-form/form/types'
import { shouldShowUke7Sporsmal } from '@features/ny-sykmelding-form/utfyllende-sporsmal/utdypende-sporsmal-utils'

describe('shouldShowUke7Sporsmal', () => {
    // TODO Need to add previously answered questions to graphql data to properly test this case
    test.skip('should return false if hasAnsweredUtdypendeSporsmal is true', () => {
        const result = shouldShowUke7Sporsmal(
            [
                {
                    periode: { fom: '2023-01-02', tom: '2023-01-10' },
                    aktivitet: { type: 'AKTIVITET_IKKE_MULIG' },
                } as unknown as AktivitetsPeriode,
            ],
            { days: 60, latestTom: '2023-01-01' },
        )
        expect(result).toBe(false)
    })
    test('should return false if current sykmelding is not aktivitetIkkeMulig', () => {
        const result = shouldShowUke7Sporsmal(
            [
                {
                    periode: { fom: '2023-01-01', tom: '2023-01-10' },
                    aktivitet: { type: 'GRADERT', grad: '50' },
                } as unknown as AktivitetsPeriode,
            ],
            { days: 60, latestTom: '2022-12-31' },
        )
        expect(result).toBe(false)
    })
    test('should return false if there is more than 16 days gap between current and previous sykmeldinger', () => {
        const result = shouldShowUke7Sporsmal(
            [
                {
                    periode: { fom: '2023-02-01', tom: '2023-02-10' },
                    aktivitet: { type: 'AKTIVITET_IKKE_MULIG' },
                } as unknown as AktivitetsPeriode,
            ],
            { days: 10, latestTom: '2023-01-10' },
        )
        expect(result).toBe(false)
    })
    test('should not return true on negative gap between current and previous sykmeldinger', () => {
        const result = shouldShowUke7Sporsmal(
            [
                {
                    periode: { fom: '2022-02-01', tom: '2022-02-10' },
                    aktivitet: { type: 'AKTIVITET_IKKE_MULIG' },
                } as unknown as AktivitetsPeriode,
            ],
            { days: 10, latestTom: '2023-01-10' },
        )
        expect(result).toBe(false)
    })
    test('should return true if there is less than 16 days gap and more than 7 weeks of continuous sykefravær in previous sykmeldinger', () => {
        const result = shouldShowUke7Sporsmal(
            [
                {
                    periode: { fom: '2025-02-20', tom: '2025-02-21' },
                    aktivitet: { type: 'AKTIVITET_IKKE_MULIG' },
                } as unknown as AktivitetsPeriode,
            ],
            { days: 50, latestTom: '2025-02-19' },
        )
        expect(result).toBe(true)
    })
    test('should return true if there is less than 16 days gap and more than 8 weeks of continuous sykefravær including current sykmelding', () => {
        const result = shouldShowUke7Sporsmal(
            [
                {
                    periode: { fom: '2025-02-19', tom: '2025-02-26' },
                    aktivitet: { type: 'AKTIVITET_IKKE_MULIG' },
                } as unknown as AktivitetsPeriode,
            ],
            { days: 49, latestTom: '2025-02-18' },
        )
        expect(result).toBe(true)
    })
    test('should return true if no previous sykmelding, but current sykmelding is more than 8 weeks', () => {
        const result = shouldShowUke7Sporsmal(
            [
                {
                    periode: { fom: '2025-01-01', tom: '2025-03-01' },
                    aktivitet: { type: 'AKTIVITET_IKKE_MULIG' },
                } as unknown as AktivitetsPeriode,
            ],
            { days: 0, latestTom: null },
        )
        expect(result).toBe(true)
    })
})
