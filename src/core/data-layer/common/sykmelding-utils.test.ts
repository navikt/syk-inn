import { describe, expect, it } from 'vitest'
import { addDays, subDays } from 'date-fns'

import { dateOnly } from '@lib/date'

import { earliestFom, isTodayOrInTheFuture, latestTom } from './sykmelding-utils'

describe('byActiveOrFutureSykmelding', () => {
    it('should return true for tom today', () => {
        expect(
            isTodayOrInTheFuture({
                values: {
                    aktivitet: [{ tom: dateOnly(new Date()) }],
                },
            }),
        ).toBe(true)
    })

    it('should return false for tom until yesterday', () => {
        expect(
            isTodayOrInTheFuture({
                values: {
                    aktivitet: [{ tom: dateOnly(subDays(new Date(), 1)) }],
                },
            }),
        ).toBe(false)
    })

    it('should return true for tom til tomorrow', () => {
        expect(
            isTodayOrInTheFuture({
                values: {
                    aktivitet: [{ tom: dateOnly(addDays(new Date(), 1)) }],
                },
            }),
        ).toBe(true)
    })

    it('should handle multiple periods in any order', () => {
        expect(
            isTodayOrInTheFuture({
                values: {
                    aktivitet: [{ tom: dateOnly(subDays(new Date(), 10)) }, { tom: dateOnly(addDays(new Date(), 1)) }],
                },
            }),
        ).toBe(true)
        expect(
            isTodayOrInTheFuture({
                values: {
                    aktivitet: [{ tom: dateOnly(addDays(new Date(), 1)) }, { tom: dateOnly(subDays(new Date(), 10)) }],
                },
            }),
        ).toBe(true)
    })
})

describe('earliestFom', () => {
    it('returns fom for single period', () => {
        expect(earliestFom({ values: { aktivitet: [{ fom: '2026-01-01' }] } })).toBe('2026-01-01')
    })

    it('returns earliest fom with multiple periods', () => {
        expect(
            earliestFom({
                values: {
                    aktivitet: [{ fom: '2026-03-01' }, { fom: '2026-02-10' }, { fom: '2026-04-13' }],
                },
            }),
        ).toBe('2026-02-10')
    })
})

describe('latestTom', () => {
    it('returns tom for single period', () => {
        expect(latestTom({ values: { aktivitet: [{ tom: '2026-12-01' }] } })).toBe('2026-12-01')
    })

    it('returns latest tom with multiple periods', () => {
        expect(
            latestTom({
                values: {
                    aktivitet: [{ tom: '2026-10-01' }, { tom: '2027-01-01' }, { tom: '2025-11-02' }],
                },
            }),
        ).toBe('2027-01-01')
    })
})
