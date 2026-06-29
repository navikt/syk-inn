import { NySykmeldingAktivitet } from '#core/redux/reducers/ny-sykmelding'

export function aktivitetDescription(aktivitet: NySykmeldingAktivitet): string {
    switch (aktivitet.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return `100% sykmelding`
        case 'GRADERT':
            return `Gradert sykmelding (${aktivitet.grad}%)${aktivitet.reisetilskudd ? ', med reisetilskudd' : ''}`
        case 'BEHANDLINGSDAGER':
            return `Sykmelding med behandlingsdager`
        case 'REISETILSKUDD':
            return `Sykmelding med reisetilskudd`
    }
}
