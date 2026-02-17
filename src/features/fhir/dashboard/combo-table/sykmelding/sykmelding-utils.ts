import { raise } from '@lib/ts'
import { toReadableDatePeriod } from '@lib/date'
import { AktivitetFragment, DiagnoseFragment, AktivitetRedacted } from '@queries'
import { earliestFom, latestTom } from '@data-layer/common/sykmelding-utils'

export function sykmeldingPeriodeText(perioder: { fom: string; tom: string }[]): string {
    const earliestPeriode = earliestFom({ values: { aktivitet: perioder } })
    const latestPeriode = latestTom({ values: { aktivitet: perioder } })

    if (!earliestPeriode || !latestPeriode) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }

    return toReadableDatePeriod(earliestPeriode, latestPeriode)
}

export function aktivitetGradText(aktivitet: AktivitetFragment | AktivitetRedacted): string {
    switch (aktivitet.__typename) {
        case 'AktivitetIkkeMulig':
            return '100%'
        case 'Gradert':
            return `${aktivitet.grad}%`
        case 'Avventende':
            return 'Avventende'
        case 'Reisetilskudd':
            return 'Reisetilskudd'
        case 'Behandlingsdager':
            return 'Behandlingsdager'
        case 'AktivitetRedacted':
            return 'Skjult'
    }
}

export function sykmeldingDiagnoseText(hoveddiagnose: DiagnoseFragment | null | undefined): string {
    return hoveddiagnose ? `${hoveddiagnose.code} - ${hoveddiagnose.text}` : 'Ingen diagnose'
}

export function sykmeldingGradText(aktivitet: AktivitetFragment[]): string {
    return aktivitetGradText(aktivitet[0])
}

export function sykmeldingArbeidsgiverText(
    arbeidsgiver: { arbeidsgivernavn: string } | null | undefined,
): string | null {
    if (!arbeidsgiver) {
        return null
    }

    return `${arbeidsgiver.arbeidsgivernavn}`
}
