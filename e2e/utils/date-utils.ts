import { addDays, format, subDays } from 'date-fns'

import { dateOnly } from '@lib/date'

export const today = (): string => dateOnly(new Date())

export const daysAgo = (days: number): string => dateOnly(subDays(new Date(), days))

export const inDays = (days: number): string => dateOnly(addDays(new Date(), days))

export const inputDate = (date: string | Date): string => format(date, 'dd.MM.yyyy')
