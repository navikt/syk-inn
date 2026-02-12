import * as z from 'zod'
import { formatISO, parseISO } from 'date-fns'

export const DateTime = z.string().transform((date) => formatISO(parseISO(date)))

export const NullableValkeyString = z.string().transform((it) => (it.trim() === '' ? null : it))

export const NullableDateTime = z.string().transform((date) => {
    if (date == null || date.trim() === '') return null

    return formatISO(parseISO(date))
})

/**
 * The sentiment is stored in valkey as nothing (''), or 1-5. This schema transforms it to a number or null.
 */
export const SentimentSchema = NullableValkeyString.transform((val) => (val == null ? null : Number(val))).pipe(
    z.number().min(1).max(5).nullable(),
)
