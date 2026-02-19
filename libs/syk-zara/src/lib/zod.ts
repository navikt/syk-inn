import * as z from 'zod'
import { formatISO, parseISO } from 'date-fns'

export const DateTime = z.string().transform((date) => formatISO(parseISO(date)))
