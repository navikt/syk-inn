import * as R from 'remeda'

import { raise } from '@utils/ts'
import { toReadableDatePeriod } from '@utils/date'
import { AktivitetFragment, DiagnoseFragment, SykmeldingFragment } from '@queries'

export function sykmeldingPeriodeText(perioder: { fom: string; tom: string }[]): string {
    const earliestPeriode = R.firstBy(perioder, [(it) => it.fom, 'desc'])
    const latestPeriode = R.firstBy(perioder, [(it) => it.fom, 'desc'])

    if (!earliestPeriode || !latestPeriode) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }

    return toReadableDatePeriod(earliestPeriode.fom, latestPeriode.tom)
}

export function sykmeldingDiagnoseText(hoveddiagnose: DiagnoseFragment | null | undefined): string {
    return hoveddiagnose ? `${hoveddiagnose.code} - ${hoveddiagnose.text}` : 'Ingen diagnose'
}

export function sykmeldingGradText(aktivitet: AktivitetFragment[]): string {
    const [first] = aktivitet

    switch (first.__typename) {
        case 'AktivitetIkkeMulig':
            return '100%'
        case 'Gradert':
            return `${first.grad}%`
        case 'Avventende':
            return 'Avventende'
        case 'Reisetilskudd':
            return 'Reisetilskudd'
        case 'Behandlingsdager':
            return 'Behandlingsdager'
        default:
            raise(`Unknown aktivitet type: ${first.type}`)
    }
}

export function sykmeldingArbeidsgiverText(arbeidsgiver: SykmeldingFragment['values']['arbeidsgiver']): string | null {
    if (!arbeidsgiver) {
        return null
    }

    return `${arbeidsgiver.arbeidsgivernavn}`
}
