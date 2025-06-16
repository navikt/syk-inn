import * as R from 'remeda'
import { isAfter, isSameDay } from 'date-fns'

import { raise } from '@utils/ts'

export function byActiveOrFutureSykmelding(sykmelding: { values: { aktivitet: { tom: string }[] } }): boolean {
    const latestPeriode = R.firstBy(sykmelding.values.aktivitet, [(it) => it.tom, 'desc'])

    if (!latestPeriode) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }

    const now = new Date()
    return isSameDay(latestPeriode.tom, now) || isAfter(latestPeriode.tom, now)
}
