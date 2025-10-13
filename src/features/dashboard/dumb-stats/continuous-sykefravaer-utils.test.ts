import { expect, describe, test } from 'vitest'

import { SykmeldingFragment } from '@queries'

import {
    calculateTotalLengthOfSykmeldinger,
    continiousSykefravaer,
    filterSykmeldingerWithinDaysGap,
    hasAnsweredUtdypendeSporsmal,
    mapSykmeldingToDateRanges,
} from './continuous-sykefravaer-utils'

describe('continiousSykefravaer', () => {
    test('happy case - uten tidligere sykmeldinger', () => {
        const days = continiousSykefravaer([])
        expect(days).toBe(0)
    })

    test('med en sykmelding kant til kant', () => {
        const days = continiousSykefravaer([
            createMockSykmelding('2023-01-01', '2023-01-15', 'OK'),
            createMockSykmelding('2023-01-16', '2023-01-31', 'OK'),
        ])
        expect(days).toBe(31)
    })

    test('med en sykmelding med 17 dager mellomrom', () => {
        const days = continiousSykefravaer([
            createMockSykmelding('2023-01-01', '2023-01-05', 'OK'),
            createMockSykmelding('2023-01-22', '2023-01-31', 'OK'),
        ])
        expect(days).toBe(10)
    })

    test('med en sykmelding med 16 dager mellomrom', () => {
        const days = continiousSykefravaer([
            createMockSykmelding('2023-01-01', '2023-01-05', 'OK'),
            createMockSykmelding('2023-01-21', '2023-01-31', 'OK'),
        ])
        expect(days).toBe(31)
    })

    test('med flere sykmeldinger med 16 dager mellomrom', () => {
        const days = continiousSykefravaer([
            createMockSykmelding('2025-01-01', '2025-01-05', 'OK'),
            createMockSykmelding('2025-01-21', '2025-01-31', 'OK'),
            createMockSykmelding('2025-02-16', '2025-02-31', 'OK'),
        ])
        expect(days).toBe(62)
    })

    test('to meb 16, så en over 16 dager mellomrom', () => {
        const days = continiousSykefravaer([
            createMockSykmelding('2025-01-01', '2025-01-05', 'OK'),
            createMockSykmelding('2025-01-21', '2025-01-31', 'OK'),
            createMockSykmelding('2025-02-17', '2025-02-31', 'OK'),
        ])
        expect(days).toBe(15)
    })
})

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
        expect(result[0]).toEqual({ earliestFom: '2023-01-01', latestTom: '2023-01-20' })
    })
    test('should filter out non-OK sykmeldinger', () => {
        const result = mapSykmeldingToDateRanges([
            { utfall: { result: 'OK' }, values: { aktivitet: [{ fom: '2023-01-01', tom: '2023-01-05' }] } },
            { utfall: { result: 'NOT_OK' }, values: { aktivitet: [{ fom: '2023-01-06', tom: '2023-01-10' }] } },
        ] as unknown as SykmeldingFragment[])
        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({ earliestFom: '2023-01-01', latestTom: '2023-01-05' })
    })
})

describe('filterSykmeldingerWithinDaysGap', () => {
    test('should return empty array when input is empty', () => {
        const result = filterSykmeldingerWithinDaysGap([])
        expect(result).toEqual([])
    })
    test('should sort by latest tom desc', () => {
        const result = filterSykmeldingerWithinDaysGap([
            { earliestFom: '2023-01-01', latestTom: '2023-01-05' },
            { earliestFom: '2023-01-06', latestTom: '2023-01-10' },
        ])
        expect(result).toHaveLength(2)
        expect(result[0].latestTom).toBe('2023-01-10')
        expect(result[1].latestTom).toBe('2023-01-05')
    })
    test('should filter out sykmeldinger with ISYFO_DAYS_GAP of 16 days or more', () => {
        const result = filterSykmeldingerWithinDaysGap([
            { earliestFom: '2025-01-01', latestTom: '2025-01-10' },
            { earliestFom: '2025-01-24', latestTom: '2025-02-01' },
            { earliestFom: '2025-02-17', latestTom: '2025-02-31' },
        ])
        expect(result).toHaveLength(1)
        expect(result[0]).toEqual({ earliestFom: '2025-02-17', latestTom: '2025-02-31' })
    })
    test('should only return the newest period with continious sykfraver', () => {
        const result = filterSykmeldingerWithinDaysGap([
            { earliestFom: '2025-01-01', latestTom: '2025-01-10' },
            { earliestFom: '2025-01-11', latestTom: '2025-01-20' },
            { earliestFom: '2024-01-01', latestTom: '2024-01-10' },
            { earliestFom: '2024-01-11', latestTom: '2024-01-20' },
        ])
        expect(result).toHaveLength(2)
        expect(result[0]).toEqual({ earliestFom: '2025-01-11', latestTom: '2025-01-20' })
        expect(result[1]).toEqual({ earliestFom: '2025-01-01', latestTom: '2025-01-10' })
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

describe('hasAnsweredUtdypendeSporsmal', () => {
    test('should return false when input is empty', () => {
        const result = hasAnsweredUtdypendeSporsmal([])
        expect(result).toBe(false)
    })
    test('should return false when no sykmelding has OK result', () => {
        const result = hasAnsweredUtdypendeSporsmal([createMockSykmelding('2023-01-01', '2023-01-05', 'NOT_OK')])
        expect(result).toBe(false)
    })
    test('should return false when no sykmelding has answered utdypende sporsmal', () => {
        const result = hasAnsweredUtdypendeSporsmal([
            {
                ...createMockSykmelding('2023-01-01', '2023-01-05', 'OK'),
                values: { __typename: 'SykmeldingValues', utdypendeSporsmal: null },
            } as unknown as SykmeldingFragment,
        ])
        expect(result).toBe(false)
    })
    test('should return true when at least one sykmelding has answered utdypende sporsmal', () => {
        const result = hasAnsweredUtdypendeSporsmal([
            {
                ...createMockSykmelding('2023-01-01', '2023-01-05', 'OK'),
                values: {
                    __typename: 'SykmeldingValues',
                    utdypendeSporsmal: { utfodringerMedArbeid: 'Arbeid', medisinskOppsummering: 'Medisinsk' },
                },
            } as unknown as SykmeldingFragment,
        ])
        expect(result).toBe(true)
    })
    test('should return false if questions are answered for a previous period', () => {})
})

const createMockSykmelding = (fom: string, tom: string, result: string): SykmeldingFragment =>
    ({
        utfall: { result },
        values: {
            aktivitet: [{ fom, tom }],
        },
    }) as unknown as SykmeldingFragment
