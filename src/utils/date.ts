import { format, getDate, isSameDay, isSameMonth, isSameYear } from 'date-fns'
import { nb } from 'date-fns/locale/nb'

export function toReadableDateNoYear(date: string | Date): string {
    return format(date, 'd. MMMM', { locale: nb })
}

export function toReadableDate(date: string | Date): string {
    return format(date, `d. MMMM yyyy`, { locale: nb })
}

/**
 * Get a text representation of the period fom to tom
 * @return {string} The period string
 */
export function toReadableDatePeriod(fom: string | Date, tom: string | Date): string {
    if (isSameDay(fom, tom)) {
        return toReadableDate(fom)
    } else if (isSameMonth(fom, tom)) {
        return `${getDate(fom)}. - ${toReadableDate(tom)}`
    } else if (isSameYear(fom, tom)) {
        return `${toReadableDateNoYear(fom)} - ${toReadableDate(tom)}`
    } else {
        return `${toReadableDate(fom)} - ${toReadableDate(tom)}`
    }
}