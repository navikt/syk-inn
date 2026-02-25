import { expect, describe, test } from 'vitest'

import { SykmeldingFragment } from '@queries'
import { SykmeldingBuilder } from '@dev/mock-engine/scenarios/SykInnApiSykmeldingBuilder'

import {
    calculateTotalLengthOfSykmeldinger,
    filterSykmeldingerWithinDaysGap,
    mapSykmeldingToDateRanges,
} from './continuous-sykefravaer-utils'

describe('mapSykmeldingToDateRanges', () => {
    test('should return empty array when input is empty', () => {
        const result = mapSykmeldingToDateRanges([])
        expect(result).toEqual([])
    })
    test('should get earliest fom and latest tom when sykmelding contains multiple periods', () => {
        const result = mapSykmeldingToDateRanges([
            {
                utfall: {
                    result: 'OK',
                },
                values: {
                    aktivitet: [
                        { fom: '2023-01-01', tom: '2023-01-05' },
                        { fom: '2023-01-10', tom: '2023-01-15' },
                        { fom: '2023-01-16', tom: '2023-01-20' },
                    ],
                },
            },
        ] as unknown as SykmeldingFragment[])
        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({ earliestFom: '2023-01-01', latestTom: '2023-01-20', utdypendeSporsmal: null })
    })
    test('should filter out non-OK sykmeldinger', () => {
        const result = mapSykmeldingToDateRanges([
            { utfall: { result: 'OK' }, values: { aktivitet: [{ fom: '2023-01-01', tom: '2023-01-05' }] } },
            { utfall: { result: 'NOT_OK' }, values: { aktivitet: [{ fom: '2023-01-06', tom: '2023-01-10' }] } },
        ] as unknown as SykmeldingFragment[])
        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({ earliestFom: '2023-01-01', latestTom: '2023-01-05', utdypendeSporsmal: null })
    })
})

describe('filterSykmeldingerWithinDaysGap', () => {
    test('should return empty array when input is empty', () => {
        const result = filterSykmeldingerWithinDaysGap([])
        expect(result).toEqual([])
    })
    test('should sort by latest tom desc', () => {
        const sykmelding1 = new SykmeldingBuilder()
            .aktivitet({ type: 'AKTIVITET_IKKE_MULIG', fom: '2023-01-01', tom: '2023-01-05' })
            .build()
        const sykmelding2 = new SykmeldingBuilder()
            .aktivitet({ type: 'AKTIVITET_IKKE_MULIG', fom: '2023-01-06', tom: '2023-01-10' })
            .build()

        const result = filterSykmeldingerWithinDaysGap([sykmelding1, sykmelding2])
        expect(result).toHaveLength(2)
        expect(result[0].values.aktivitet[0].tom).toBe('2023-01-10')
        expect(result[1].values.aktivitet[0].tom).toBe('2023-01-05')
    })
    test('should filter out sykmeldinger with ISYFO_DAYS_GAP of 16 days or more', () => {
        const sykmelding1 = new SykmeldingBuilder()
            .aktivitet({ type: 'AKTIVITET_IKKE_MULIG', fom: '2025-01-01', tom: '2025-01-10' })
            .build()
        const sykmelding2 = new SykmeldingBuilder()
            .aktivitet({ type: 'AKTIVITET_IKKE_MULIG', fom: '2025-01-24', tom: '2025-02-01' })
            .build()
        const sykmelding3 = new SykmeldingBuilder()
            .aktivitet({ type: 'AKTIVITET_IKKE_MULIG', fom: '2025-02-17', tom: '2025-02-31' })
            .build()

        const result = filterSykmeldingerWithinDaysGap([sykmelding1, sykmelding2, sykmelding3])
        expect(result).toHaveLength(1)
        expect(result[0].values.aktivitet[0].fom).toBe('2025-02-17')
        expect(result[0].values.aktivitet[0].tom).toBe('2025-02-31')
    })
    test('should only return the newest period with continious sykfraver', () => {
        const sykmelding1 = new SykmeldingBuilder()
            .aktivitet({ type: 'AKTIVITET_IKKE_MULIG', fom: '2025-01-01', tom: '2025-01-10' })
            .build()
        const sykmelding2 = new SykmeldingBuilder()
            .aktivitet({ type: 'AKTIVITET_IKKE_MULIG', fom: '2025-01-11', tom: '2025-01-20' })
            .build()
        const sykmelding3 = new SykmeldingBuilder()
            .aktivitet({ type: 'AKTIVITET_IKKE_MULIG', fom: '2024-01-01', tom: '2024-01-10' })
            .build()
        const sykmelding4 = new SykmeldingBuilder()
            .aktivitet({ type: 'AKTIVITET_IKKE_MULIG', fom: '2024-01-11', tom: '2024-01-20' })
            .build()

        const result = filterSykmeldingerWithinDaysGap([sykmelding1, sykmelding2, sykmelding3, sykmelding4])
        expect(result).toHaveLength(2)
        expect(result[0].values.aktivitet[0].fom).toBe('2025-01-11')
        expect(result[0].values.aktivitet[0].tom).toBe('2025-01-20')
        expect(result[1].values.aktivitet[0].fom).toBe('2025-01-01')
        expect(result[1].values.aktivitet[0].tom).toBe('2025-01-10')
    })
})

describe('calculateTotalLengthOfSykmeldinger', () => {
    test('should return 0 when input is empty', () => {
        const result = calculateTotalLengthOfSykmeldinger([])
        expect(result).toBe(0)
    })
    test('calculates correct for single sykmelding', () => {
        const result = calculateTotalLengthOfSykmeldinger([{ earliestFom: '2023-01-01', latestTom: '2023-01-10' }])
        expect(result).toBe(10)
    })
    test('calculates correct for two sykmeldinger without any days gap', () => {
        const result = calculateTotalLengthOfSykmeldinger([
            { earliestFom: '2023-01-11', latestTom: '2023-01-20' },
            { earliestFom: '2023-01-01', latestTom: '2023-01-10' },
        ])
        expect(result).toBe(20)
    })
    test('calculates correct for two sykmeldinger with 15 days gap', () => {
        const result = calculateTotalLengthOfSykmeldinger([
            { earliestFom: '2023-01-25', latestTom: '2023-01-31' },
            { earliestFom: '2023-01-01', latestTom: '2023-01-10' },
        ])
        expect(result).toBe(31)
    })
})
