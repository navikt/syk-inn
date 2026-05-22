import { ArbeidsrelatertArsakInput, InputAktivitet, OpprettSykmeldingInput } from '@queries'

import { anything } from './assertions'

export const diagnoseSelection = {
    angst: {
        pick: { search: 'Angst', select: /Angstlidelse/ },
        verify: { system: 'ICPC2', code: 'P74' },
    },
    tobakkmisbruk: {
        pick: { search: 'P17', select: /Tobakkmisbruk/ },
        verify: { system: 'ICPC2', code: 'P17' },
    },
    any: {
        verify: { system: anything(), code: anything() },
    },
    fhirPrefills: {
        botulisme: {
            verify: { system: 'ICD10', code: 'A051' },
        },
        bruddLeggAnkel: {
            verify: { system: 'ICPC2', code: 'L73' },
        },
        angstlidelse: {
            verify: { system: 'ICPC2', code: 'P74' },
        },
    },
} as const

export const defaultOpprettSykmeldingValues: Omit<OpprettSykmeldingInput, 'aktivitet'> = {
    hoveddiagnose: diagnoseSelection.any.verify,
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
        arbeidsrelaterteUtfordringer: null,
        behandlingOgFremtidigArbeid: null,
        forventetHelsetilstandUtvikling: null,
        medisinskeHensyn: null,
        oppdatertMedisinskStatus: null,
        realistiskMestringArbeid: null,
        sykdomsutvikling: null,
        uavklarteForhold: null,
    },
    annenFravarsgrunn: null,
}

export const defaultAktivitetIkkeMulig = ({
    fom,
    tom,
    arbeidsrelatertArsak,
}: {
    fom: string
    tom: string
    arbeidsrelatertArsak?: ArbeidsrelatertArsakInput
}): InputAktivitet => ({
    aktivitetIkkeMulig: {
        fom: fom,
        tom: tom,
        arbeidsrelatertArsak: arbeidsrelatertArsak || {
            isArbeidsrelatertArsak: false,
            arbeidsrelaterteArsaker: [],
            annenArbeidsrelatertArsak: null,
        },
    },
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
    gradert: {
        fom: fom,
        tom: tom,
        grad: grad,
        reisetilskudd: false,
    },
})
