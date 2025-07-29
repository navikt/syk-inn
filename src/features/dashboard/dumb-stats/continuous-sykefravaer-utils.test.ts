import { expect, describe, test } from 'vitest'

import { continiousSykefravaer } from '@features/dashboard/dumb-stats/continuous-sykefravaer-utils'
import { SykmeldingFragment } from '@queries'

describe('continiousSykefravaer', () => {
    test('happy case - uten tidligere sykmeldinger', () => {
        const days = continiousSykefravaer([])
        expect(days).toBe(0)
    })

    test('med en sykmelding kant til kant', () => {
        const days = continiousSykefravaer([
            createMockSykmelding('2023-01-01', '2023-01-15'),
            createMockSykmelding('2023-01-16', '2023-01-31'),
        ])
        expect(days).toBe(31)
    })

    test('med en sykmelding med 17 dager mellomrom', () => {
        const days = continiousSykefravaer([
            createMockSykmelding('2023-01-01', '2023-01-05'),
            createMockSykmelding('2023-01-22', '2023-01-31'),
        ])
        expect(days).toBe(10)
    })

    test('med en sykmelding med 16 dager mellomrom', () => {
        const days = continiousSykefravaer([
            createMockSykmelding('2023-01-01', '2023-01-05'),
            createMockSykmelding('2023-01-21', '2023-01-31'),
        ])
        expect(days).toBe(31)
    })

    test('med flere sykmeldinger med 16 dager mellomrom', () => {
        const days = continiousSykefravaer([
            createMockSykmelding('2025-01-01', '2025-01-05'),
            createMockSykmelding('2025-01-21', '2025-01-31'),
            createMockSykmelding('2025-02-16', '2025-02-31'),
        ])
        expect(days).toBe(62)
    })

    test('to meb 16, så en over 16 dager mellomrom', () => {
        const days = continiousSykefravaer([
            createMockSykmelding('2025-01-01', '2025-01-05'),
            createMockSykmelding('2025-01-21', '2025-01-31'),
            createMockSykmelding('2025-02-17', '2025-02-31'),
        ])
        expect(days).toBe(15)
    })
})

const createMockSykmelding = (fom: string, tom: string): SykmeldingFragment =>
    ({
        values: {
            aktivitet: [{ fom, tom }],
        },
    }) as unknown as SykmeldingFragment
