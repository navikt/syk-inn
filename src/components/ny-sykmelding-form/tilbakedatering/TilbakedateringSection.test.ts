import { describe, expect, it } from 'vitest'

import { AktivitetsPeriode } from '@components/ny-sykmelding-form/form'
import { isTilbakedatering } from '@components/ny-sykmelding-form/tilbakedatering/DynamicTilbakedateringSection'

describe('isTilbakedatering', () => {
    it('should return true if the only period is older than 8 days before sykmeldingsdato', () => {
        const perioder: Pick<AktivitetsPeriode, 'periode'>[] = [
            {
                periode: {
                    fom: '2025-01-01',
                    tom: '2025-02-01',
                },
            },
        ]
        const result = isTilbakedatering(perioder, new Date('2025-01-10'))
        expect(result).toBe(true)
    })
    it('should return true if the first period is older than 8 days before sykmeldingsdato', () => {
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
        const result = isTilbakedatering(perioder, new Date('2025-01-10'))
        expect(result).toBe(true)
    })
    it('should return false if the first period is newer than 8 days before sykmeldingsdato', () => {
        const perioder: Pick<AktivitetsPeriode, 'periode'>[] = [
            {
                periode: {
                    fom: '2025-01-01',
                    tom: '2025-02-01',
                },
            },
        ]
        const result = isTilbakedatering(perioder, new Date('2025-01-09'))
        expect(result).toBe(false)
    })
})
