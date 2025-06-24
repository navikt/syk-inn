import { describe, expect, it } from 'vitest'

import { AktivitetsPeriode } from '@components/ny-sykmelding-form/form'
import { isTilbakedatering } from '@components/ny-sykmelding-form/tilbakedatering/DynamicTilbakedateringSection'

describe('isTilbakedatering', () => {
    it('should return true if the only period is older than 5 days before sykmeldingsdato', () => {
        const perioder: Pick<AktivitetsPeriode, 'periode'>[] = [
            {
                periode: {
                    fom: '2025-01-01',
                    tom: '2025-02-01',
                },
            },
        ]

        // 5 days
        const result = isTilbakedatering(perioder, new Date('2025-01-07'))
        expect(result).toBe(true)
    })

    it('should return true if the only period is older than 5 days before sykmeldingsdato', () => {
        const perioder: Pick<AktivitetsPeriode, 'periode'>[] = [
            {
                periode: {
                    fom: '2025-01-01',
                    tom: '2025-02-01',
                },
            },
        ]

        // 8 days exactly
        const result = isTilbakedatering(perioder, new Date('2025-01-06'))
        expect(result).toBe(false)
    })

    it('should return true if the first period is older than 5 days before sykmeldingsdato', () => {
        const perioder: Pick<AktivitetsPeriode, 'periode'>[] = [
            {
                periode: {
                    fom: '2025-01-01',
                    tom: '2025-02-01',
                },
            },
            {
                periode: {
                    fom: '2025-01-11',
                    tom: '2025-01-20',
                },
            },
        ]

        const result = isTilbakedatering(perioder, new Date('2025-01-07'))
        expect(result).toBe(true)
    })

    it('should return false if the first period is newer than 5 days before sykmeldingsdato', () => {
        const perioder: Pick<AktivitetsPeriode, 'periode'>[] = [
            {
                periode: {
                    fom: '2025-01-01',
                    tom: '2025-02-01',
                },
            },
        ]

        const result = isTilbakedatering(perioder, new Date('2025-01-06'))
        expect(result).toBe(false)
    })

    it('should not think its a tilbakedatering when theres a periode but everything is null', () => {
        const perioder: Pick<AktivitetsPeriode, 'periode'>[] = [
            {
                periode: {
                    fom: null,
                    tom: null,
                },
            },
        ]

        const result = isTilbakedatering(perioder, new Date('2025-01-09'))
        expect(result).toBe(false)
    })
})
