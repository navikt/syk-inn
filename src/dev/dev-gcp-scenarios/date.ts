import { subDays } from 'date-fns'

import { dateOnly } from '#lib/date'

export function scenarioPeriode(length: number, offset: number): { fom: string; tom: string } {
    const now = new Date()
    const fom = dateOnly(subDays(now, length - 1 + -offset))
    const tom = dateOnly(subDays(now, -offset))

    return { fom, tom }
}
