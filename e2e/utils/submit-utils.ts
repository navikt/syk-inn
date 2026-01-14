import { InputAktivitet, OpprettSykmeldingInput } from '@queries'

export const defaultOpprettSykmeldingValues: Omit<OpprettSykmeldingInput, 'hoveddiagnose' | 'aktivitet'> = {
    bidiagnoser: [],
    meldinger: { tilNav: null, tilArbeidsgiver: null },
    svangerskapsrelatert: false,
    yrkesskade: { yrkesskade: false, skadedato: null },
    tilbakedatering: null,
    arbeidsforhold: null,
    pasientenSkalSkjermes: false,
    utdypendeSporsmal: {
        utfordringerMedArbeid: null,
        medisinskOppsummering: null,
        hensynPaArbeidsplassen: null,
    },
}

export const defaultAktivitetIkkeMulig = ({ fom, tom }: { fom: string; tom: string }): InputAktivitet => ({
    type: 'AKTIVITET_IKKE_MULIG',
    fom: fom,
    tom: tom,
    aktivitetIkkeMulig: {
        medisinskArsak: { isMedisinskArsak: true },
        arbeidsrelatertArsak: {
            isArbeidsrelatertArsak: false,
            arbeidsrelaterteArsaker: [],
            annenArbeidsrelatertArsak: null,
        },
    },
    avventende: null,
    gradert: null,
    behandlingsdager: null,
    reisetilskudd: null,
})

export const diagnoseSelection = {
    angst: {
        pick: { search: 'Angst', select: /Angstlidelse/ },
        verify: { system: 'ICPC2', code: 'P74' },
    },
} as const
