import * as z from 'zod'
import { formatISO, parseISO } from 'date-fns'

export const DateTime = z.string().transform((date) => formatISO(parseISO(date)))

export const NullableValkeyString = z.string().transform((it) => (it.trim() === '' ? null : it))

export const NullableDateTime = z.string().transform((date) => {
    if (date == null || date.trim() === '') return null

    return formatISO(parseISO(date))
})
