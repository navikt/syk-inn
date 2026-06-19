import { formatISO, parseISO } from 'date-fns'
import * as z from 'zod'

export const DateOnly = z.string().transform((date) => formatISO(parseISO(date), { representation: 'date' }))

export const DateTime = z.string().transform((date) => formatISO(parseISO(date)))
