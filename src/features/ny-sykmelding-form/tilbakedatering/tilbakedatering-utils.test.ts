import { describe, expect, it } from 'vitest'
import { parseISO } from 'date-fns'

import { AktivitetsPeriode } from '../form/types'

import { isTilbakedatering } from './tilbakedatering-utils'

describe('isTilbakedatering', () => {
    it('should return true if the only period is older than 4 days before sykmeldingsdato', () => {
        const perioder: Pick<AktivitetsPeriode, 'periode'>[] = [
            {
                periode: {
                    fom: '2025-01-01',
                    tom: '2025-02-01',
                },
            },
        ]

        // 5 days
        const result = isTilbakedatering(perioder, parseISO('2025-01-06T12:00:00Z'))
        expect(result).toBe(true)
    })

    it('should return false if the only period is exactly 4 days before sykmeldingsdato', () => {
        const perioder: Pick<AktivitetsPeriode, 'periode'>[] = [
            {
                periode: {
                    fom: '2025-01-01',
                    tom: '2025-02-01',
                },
            },
        ]

        // 4 days exactly
        const result = isTilbakedatering(perioder, parseISO('2025-01-05T12:00:00Z'))
        expect(result).toBe(false)
    })

    it('should return true if the first period is older than 4 days before sykmeldingsdato', () => {
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

        // 5 days
        const result = isTilbakedatering(perioder, parseISO('2025-01-06T12:00:00Z'))
        expect(result).toBe(true)
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

        const result = isTilbakedatering(perioder, parseISO('2025-01-09T12:00:00Z'))
        expect(result).toBe(false)
    })
})
