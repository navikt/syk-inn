import { raise } from '@lib/ts'
import { toReadableDatePeriod } from '@lib/date'
import { AktivitetFragment, DiagnoseFragment } from '@queries'

export function sykmeldingPeriodeText(periode: { fom: string; tom: string }): string {
    if (!periode.fom || !periode.tom) {
        raise('Sykmelding without aktivitetsperioder, this should not happen')
    }

    return toReadableDatePeriod(periode.fom, periode.tom)
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
    }
}

export function sykmeldingArbeidsgiverText(
    arbeidsgiver: { arbeidsgivernavn: string } | null | undefined,
): string | null {
    if (!arbeidsgiver) {
        return null
    }

    return `${arbeidsgiver.arbeidsgivernavn}`
}
