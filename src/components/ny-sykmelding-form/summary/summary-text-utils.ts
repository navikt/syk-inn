import { AktivitetStep } from '../../../providers/redux/reducers/ny-sykmelding-multistep'

export function aktivitetDescription(aktivitet: AktivitetStep): string {
    switch (aktivitet.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return `Aktivitet ikke mulig (100% sykmeldt)`
        case 'GRADERT':
            return `Redusert aktivitet (${aktivitet.grad}% sykmeldt)`
    }
}
