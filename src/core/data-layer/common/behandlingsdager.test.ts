import { describe, expect, it } from 'vitest'

import { getNumberOfBehandlingsdager } from './behandlingsdager'

describe('getNumberOfBehandlingsdager', () => {
    it('should give one behandlingsdag for 7 days', () => {
        const days = getNumberOfBehandlingsdager(new Date('2026-05-25'), new Date('2026-05-31'))

        expect(days).toBe(1)
    })

    it('should give two behandlingsdag for 8 days', () => {
        const days = getNumberOfBehandlingsdager(new Date('2026-05-25'), new Date('2026-06-01'))

        expect(days).toBe(2)
    })

    it('should give two behandlingsdag for 14 days', () => {
        const days = getNumberOfBehandlingsdager(new Date('2026-05-25'), new Date('2026-06-07'))

        expect(days).toBe(2)
    })

    it('should give three behandlingsdag for 15 days', () => {
        const days = getNumberOfBehandlingsdager(new Date('2026-05-25'), new Date('2026-06-08'))

        expect(days).toBe(3)
    })
})
