import { describe, expect, test } from 'vitest'

import { AktivitetsPeriode } from '@features/ny-sykmelding-form/form'
import { shouldShowUke7Sporsmal } from '@features/ny-sykmelding-form/utfyllende-sporsmal/utdypende-sporsmal-utils'

describe('shouldShowUke7Sporsmal', () => {
    test('should return false if hasAnsweredUtdypendeSporsmal is true', () => {
        const result = shouldShowUke7Sporsmal([], [], true)
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
            [],
            false,
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
            [{ earliestFom: '2023-01-01', latestTom: '2023-01-10' }],
            false,
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
            [{ earliestFom: '2023-01-01', latestTom: '2023-01-10' }],
            false,
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
            [{ earliestFom: '2025-01-01', latestTom: '2025-02-19' }],
            false,
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
            [{ earliestFom: '2025-01-01', latestTom: '2025-02-18' }],
            false,
        )
        expect(result).toBe(true)
    })
})
