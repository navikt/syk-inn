import { describe, it, expect } from 'vitest'
import { parseISO } from 'date-fns'

import { dateOnly } from '@lib/date'

import { parseShorthand } from './periode-shorthand'

describe('parseShorthand', () => {
    const staticNow = parseISO('2025-06-07')

    it.each([
        { value: '7d', from: '2025-06-07', to: '2025-06-13' },
        { value: '13d', from: '2025-06-07', to: '2025-06-19' },
        { value: '60d', from: '2025-06-07', to: '2025-08-05' },
        { value: '1u', from: '2025-06-07', to: '2025-06-13' },
        { value: '2u', from: '2025-06-07', to: '2025-06-20' },
        { value: '1m', from: '2025-06-07', to: '2025-07-06' },
    ])('should handle a simple case, $value', ({ value, from, to }) => {
        const result = parseShorthand(value, staticNow)

        expect(toAssertableRange(result)).toEqual({ from, to })
    })

    it('should handle a case with offset, +2 7d', () => {
        const value = '+2 7d'
        const result = parseShorthand(value, staticNow)

        expect(toAssertableRange(result)).toEqual({
            from: '2025-06-09',
            to: '2025-06-15',
        })
    })

    it('should handle a case with offset on right side, 7d +2', () => {
        const value = '7d +2'
        const result = parseShorthand(value, staticNow)

        expect(toAssertableRange(result)).toEqual({
            from: '2025-06-09',
            to: '2025-06-15',
        })
    })

    it('should handle a case with offset on right side and inverse, 7d 2+', () => {
        const value = '7d 2+'
        const result = parseShorthand(value, staticNow)

        expect(toAssertableRange(result)).toEqual({
            from: '2025-06-09',
            to: '2025-06-15',
        })
    })

    it('should handle a case with offset, -2 7d', () => {
        const value = '-2 7d'
        const result = parseShorthand(value, staticNow)

        expect(toAssertableRange(result)).toEqual({
            from: '2025-06-05',
            to: '2025-06-11',
        })
    })

    it('should handle a case with offset, +2 2u', () => {
        const value = '+2 2u'
        const result = parseShorthand(value, staticNow)

        expect(toAssertableRange(result)).toEqual({
            from: '2025-06-09',
            to: '2025-06-22',
        })
    })

    it('should handle a case with offset inverse, 2- 7d', () => {
        const value = '2- 7d'
        const result = parseShorthand(value, staticNow)

        expect(toAssertableRange(result)).toEqual({
            from: '2025-06-05',
            to: '2025-06-11',
        })
    })

    it('should handle a case with offset inverse, 2+ 2u', () => {
        const value = '2+ 2u'
        const result = parseShorthand(value, staticNow)

        expect(toAssertableRange(result)).toEqual({
            from: '2025-06-09',
            to: '2025-06-22',
        })
    })
})

function toAssertableRange(range: { from: Date; to: Date } | null): { from: string; to: string } {
    if (!range) throw new Error('Expected a valid range, got null')

    return {
        from: dateOnly(range.from),
        to: dateOnly(range.to),
    }
}
