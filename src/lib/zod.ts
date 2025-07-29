import * as z from 'zod'
import { formatISO, parseISO } from 'date-fns'

export const DateOnly = z.string().transform((date) => formatISO(parseISO(date), { representation: 'date' }))
