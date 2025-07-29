import * as R from 'remeda'
import { isAfter, isSameDay } from 'date-fns'

import { raise } from '@lib/ts'
import { SykmeldingFragment } from '@queries'

export function byActiveOrFutureSykmelding(sykmelding: { values: { aktivitet: { tom: string }[] } }): boolean {
    const latestPeriode = R.firstBy(sykmelding.values.aktivitet, [(it) => it.tom, 'desc'])

    if (!latestPeriode) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }

    const now = new Date()
    return isSameDay(latestPeriode.tom, now) || isAfter(latestPeriode.tom, now)
}

export function earliestFom(sykmelding: SykmeldingFragment): string {
    const firstFom = R.firstBy(sykmelding.values.aktivitet, [(it) => it.fom, 'desc'])
    if (!firstFom) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }
    return firstFom.fom
}

export function latestTom(sykmelding: SykmeldingFragment): string {
    const latestTom = R.firstBy(sykmelding.values.aktivitet, [(it) => it.fom, 'desc'])
    if (!latestTom) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }
    return latestTom.tom
}
