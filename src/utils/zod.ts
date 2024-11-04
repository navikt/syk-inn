import { z } from 'zod'
import { formatISO } from 'date-fns'

export const DateOnly = z.date().transform((date) => formatISO(date, { representation: 'date' }))
