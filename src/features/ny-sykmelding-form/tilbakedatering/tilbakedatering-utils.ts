import * as R from 'remeda'
import { isBefore, parseISO, subDays } from 'date-fns'

import { AktivitetsPeriode } from '../form'

export function isTilbakedatering(perioder: Pick<AktivitetsPeriode, 'periode'>[], sykmeldingsDato: Date): boolean {
    const firstFom = R.pipe(
        perioder,
        R.map((it) => it.periode?.fom),
        R.filter(R.isNonNull),
        R.firstBy(R.identity()),
    )

    // 4 days is OK, but 5 or more is tilbakedatering and needs begrunnelse, inclusive in both ends.
    return firstFom ? isBefore(parseISO(firstFom), subDays(sykmeldingsDato, 5)) : false
}
