import { AnnenFravarsgrunnArsak } from '@queries'

export function annenFravarsgrunnToText(grunn: AnnenFravarsgrunnArsak): string {
    switch (grunn) {
        case 'ABORT':
            return 'Pasienten er arbeidsufør som følge av svangerskapsavbrudd'
        case 'BEHANDLING_FORHINDRER_ARBEID':
            return 'Pasienten er under behandling som gjør det nødvendig med fravær fra arbeid (ikke enkeltstående behandlingsdager)'
        case 'ARBEIDSRETTET_TILTAK':
            return 'Pasienten deltar på et arbeidsrettet tiltak'
        case 'BEHANDLING_STERILISERING':
            return 'Pasienten er arbeidsufør som følge av behandling i forbindelse med sterilisering'
        case 'DONOR':
            return 'Pasienten er donor eller er under vurdering som donor'
        case 'GODKJENT_HELSEINSTITUSJON':
            return 'Pasienten er innlagt i en godkjent helseinstitusjon'
        case 'MOTTAR_TILSKUDD_GRUNNET_HELSETILSTAND':
            return 'Pasienten mottar tilskott til opplæringstiltak på grunn av sykdom, skade eller lyte'
        case 'NODVENDIG_KONTROLLUNDENRSOKELSE':
            return 'Pasienten er til nødvendig kontrollundersøkelse som krever minst 24 timers fravær'
        case 'SMITTEFARE':
            return 'Pasienten har forbud mot å arbeide på grunn av smittefare'
        case 'UFOR_GRUNNET_BARNLOSHET':
            return 'Pasienten er arbeidsufør som følge av behandling for barnløshet'
    }
}
