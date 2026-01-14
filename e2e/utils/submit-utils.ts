import { AktivitetIkkeMuligInput, InputAktivitet, OpprettSykmeldingInput } from '@queries'

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

export const defaultAktivitetIkkeMulig = ({
    fom,
    tom,
    aktivitetIkkeMulig,
}: {
    fom: string
    tom: string
    aktivitetIkkeMulig?: AktivitetIkkeMuligInput
}): InputAktivitet => ({
    type: 'AKTIVITET_IKKE_MULIG',
    fom: fom,
    tom: tom,
    aktivitetIkkeMulig: aktivitetIkkeMulig || {
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

export const defaultAktivitetGradert = ({
    fom,
    tom,
    grad,
}: {
    fom: string
    tom: string
    grad: number
}): InputAktivitet => ({
    type: 'GRADERT',
    fom: fom,
    tom: tom,
    gradert: { grad: grad, reisetilskudd: false },
    aktivitetIkkeMulig: null,
    avventende: null,
    behandlingsdager: null,
    reisetilskudd: null,
})

export const diagnoseSelection = {
    angst: {
        pick: { search: 'Angst', select: /Angstlidelse/ },
        verify: { system: 'ICPC2', code: 'P74' },
    },
    tobakkmisbruk: {
        pick: { search: 'P17', select: /Tobakkmisbruk/ },
        verify: { system: 'ICPC2', code: 'P17' },
    },
} as const
