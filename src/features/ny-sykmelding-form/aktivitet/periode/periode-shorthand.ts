import { addDays, addMonths, addWeeks, parseISO, subDays } from 'date-fns'

import { isDateValid } from '@lib/date'

type ValidShorthand = 'd' | 'u' | 'm'
type ShorthandTuple = [unit: ValidShorthand, amount: number]

/**
 * Same as {@link parseShorthand}, but takes into account the currently selected from date and
 * which input field is being interactied with. When there already is a date, and user is interacting
 * with the tom field, the fom should stay the same.
 */
export function getShorthandRange(
    currentFom: string | null,
    side: 'fom' | 'tom' | null,
    value: string | null,
): { from: Date; to: Date } | null {
    if (!value || !side) return null

    /**
     * When the event is triggered from the "tom" field, and we have a valid fom-date already, assume
     * the user want to add days from the "fom" date instead of overwriting it.
     */
    const from = side === 'tom' && currentFom && isDateValid(currentFom) ? parseISO(currentFom) : new Date()

    return parseShorthand(value, from)
}

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
        // Look for shorthand with offset, both sides
        const offset = matchOffset(splat[0]) ?? matchOffset(splat[1])
        // If no valid offset, we give up
        if (offset === null) return null

        // If right side was offset, fallback to left side for shorthand
        const shorthand = matchShorthand(splat[1]) ?? matchShorthand(splat[0])
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
    const reversed = value.endsWith('-') || value.endsWith('+') ? value.split('').reverse().join('') : value
    const match = reversed.match(/^([+-]\d+)$/)
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
