import { describe, expect, it } from 'vitest'
import { addDays, subDays } from 'date-fns'

import { dateOnly } from '@utils/date'

import { byActiveOrFutureSykmelding } from './sykmelding-utils'

describe('byActiveOrFutureSykmelding', () => {
    it('should return true for tom today', () => {
        expect(
            byActiveOrFutureSykmelding({
                values: {
                    aktivitet: [{ tom: dateOnly(new Date()) }],
                },
            }),
        ).toBe(true)
    })

    it('should return false for tom until yesterday', () => {
        expect(
            byActiveOrFutureSykmelding({
                values: {
                    aktivitet: [{ tom: dateOnly(subDays(new Date(), 1)) }],
                },
            }),
        ).toBe(false)
    })

    it('should return true for tom til tomorrow', () => {
        expect(
            byActiveOrFutureSykmelding({
                values: {
                    aktivitet: [{ tom: dateOnly(addDays(new Date(), 1)) }],
                },
            }),
        ).toBe(true)
    })

    it('should handle multiple periods in any order', () => {
        expect(
            byActiveOrFutureSykmelding({
                values: {
                    aktivitet: [{ tom: dateOnly(subDays(new Date(), 10)) }, { tom: dateOnly(addDays(new Date(), 1)) }],
                },
            }),
        ).toBe(true)
        expect(
            byActiveOrFutureSykmelding({
                values: {
                    aktivitet: [{ tom: dateOnly(addDays(new Date(), 1)) }, { tom: dateOnly(subDays(new Date(), 10)) }],
                },
            }),
        ).toBe(true)
    })
})
