import { formatISO, parseISO } from 'date-fns'
import * as z from 'zod'

export const DateTime = z.string().transform((date) => formatISO(parseISO(date)))
