import { expect, describe, test } from 'vitest'

import { SykmeldingFragment } from '@queries'

import { calculateContinuousSykefravaer, continiousSykefravaer, sortAndFilter } from './continuous-sykefravaer-utils'

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

describe('sortAndFilter', () => {
    test('should return empty array when input is empty', () => {
        const result = sortAndFilter([])
        expect(result).toEqual([])
    })
    test('should filter out non-OK sykmeldinger', () => {
        const result = sortAndFilter([
            { utfall: { result: 'OK' }, values: { aktivitet: [{ fom: '2023-01-01', tom: '2023-01-05' }] } },
            { utfall: { result: 'NOT_OK' }, values: { aktivitet: [{ fom: '2023-01-06', tom: '2023-01-10' }] } },
        ] as unknown as SykmeldingFragment[])
        expect(result).toHaveLength(1)
        expect(result[0].utfall?.result).toBe('OK')
    })
    test('should sort by latest tom asc', () => {
        const result = sortAndFilter([
            createMockSykmelding('2023-01-01', '2023-01-05', 'OK'),
            createMockSykmelding('2023-01-06', '2023-01-10', 'OK'),
        ])
        expect(result).toHaveLength(2)
        expect(result[0].values.aktivitet[0].tom).toBe('2023-01-05')
        expect(result[1].values.aktivitet[0].tom).toBe('2023-01-10')
    })
    test('should filter out sykmeldinger with ISYFO_DAYS_GAP of 16 days or more', () => {
        const result = sortAndFilter([
            createMockSykmelding('2025-01-01', '2025-01-10', 'OK'),
            createMockSykmelding('2025-01-24', '2025-02-01', 'OK'),
            createMockSykmelding('2025-02-17', '2025-02-31', 'OK'),
        ])
        expect(result).toHaveLength(2)
    })
})

describe('calculateContinuousSykefravaer', () => {
    test('should return 0 when input is empty', () => {
        const result = calculateContinuousSykefravaer([])
        expect(result).toBe(0)
    })
    test('calculates correct for single sykmelding', () => {
        const result = calculateContinuousSykefravaer([createMockSykmelding('2023-01-01', '2023-01-10', 'OK')])
        expect(result).toBe(10)
    })
    test('calculates correct for two sykmeldinger without any days gap', () => {
        const result = calculateContinuousSykefravaer([
            createMockSykmelding('2023-01-11', '2023-01-20', 'OK'),
            createMockSykmelding('2023-01-01', '2023-01-10', 'OK'),
        ])
        expect(result).toBe(20)
    })
    test('calculates correct for two sykmeldinger with 15 days gap', () => {
        const result = calculateContinuousSykefravaer([
            createMockSykmelding('2023-01-25', '2023-01-31', 'OK'),
            createMockSykmelding('2023-01-01', '2023-01-10', 'OK'),
        ])
        expect(result).toBe(31)
    })
})

const createMockSykmelding = (fom: string, tom: string, result: string): SykmeldingFragment =>
    ({
        utfall: { result },
        values: {
            aktivitet: [{ fom, tom }],
        },
    }) as unknown as SykmeldingFragment
