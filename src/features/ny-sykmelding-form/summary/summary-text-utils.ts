import { NySykmeldingAktivitet } from '@core/redux/reducers/ny-sykmelding'

export function aktivitetDescription(aktivitet: NySykmeldingAktivitet): string {
    switch (aktivitet.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return `Aktivitet ikke mulig (100% sykmeldt)`
        case 'GRADERT':
            return `Redusert aktivitet (${aktivitet.grad}% sykmeldt)`
    }
}
