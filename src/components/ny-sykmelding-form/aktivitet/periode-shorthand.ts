import { addDays, addMonths, addWeeks, subDays } from 'date-fns'

type ValidShorthand = 'd' | 'u' | 'm'
type ShorthandTuple = [unit: ValidShorthand, amount: number]

/**
 * Looks for two types of shorthand:
 *
 * With offset:
 * - +2 7d → 7 days two days from today
 * - -2 2u → 2 weeks from two days ago
 *
 * Without offset:
 * - 7d → 7 days from today
 * - 2u → 2 weeks from today
 * - 1m → 1 month from today
 */
export function parseShorthand(value: string, now = new Date()): { from: Date; to: Date } | null {
    const splat = value.split(' ')
    if (splat.length === 1) {
        // Look for shorthand without offset
        const shorthand = matchShorthand(splat[0])
        if (!shorthand) return null

        return shorthandToRange(shorthand, now)
    } else if (splat.length === 2) {
        // Look for shorthand with offset
        const offset = matchOffset(splat[0])
        // If no valid offset, we give up
        if (offset === null) return null

        const shorthand = matchShorthand(splat[1])
        if (!shorthand) return null

        return shorthandToRange(shorthand, addDays(now, offset))
    }

    return null
}

/**
 * Regex that matches the shorthand time format.
 *
 * Currently supported formats:
 * - '7d' for 7 days
 * - '2u' for 2 weeks (uker)
 * - '1m' for 1 month
 */
function matchShorthand(value: string): ShorthandTuple | null {
    const match = value.match(/^(\d+)([dum])$/)
    if (!match) return null

    const amount: number = parseInt(match[1])
    if (isNaN(amount)) return null

    const unit = match[2] as 'd' | 'u' | 'm'

    return [unit, amount]
}

function matchOffset(value: string): number | null {
    const match = value.match(/^([+-]\d+)$/)
    if (!match) return null

    const offset = parseInt(match[1])
    if (isNaN(offset)) return null

    return offset
}

/**
 * Takes a shorthand and converts it to the appropriate date range.
 *
 * Navs date ranges are inclusive in both ends. This maths handles that.
 */
function shorthandToRange([unit, amount]: ShorthandTuple, from: Date): { from: Date; to: Date } {
    switch (unit) {
        case 'd':
            return { from, to: addDays(from, amount - 1) }
        case 'u':
            return { from, to: subDays(addWeeks(from, amount), 1) }
        case 'm':
            return { from, to: subDays(addMonths(from, amount), 1) }
    }
}
