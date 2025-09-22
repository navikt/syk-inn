import { ArbeidsrelatertArsakType } from '@queries'
import { Diagnose } from '@data-layer/common/diagnose'
import { TilbakedateringGrunn } from '@data-layer/common/tilbakedatering'

export type NySykmeldingArbeidsforhold = {
    harFlereArbeidsforhold: boolean | null
    sykmeldtFraArbeidsforhold: string | null
}

export type NySykmeldingAktivitet =
    | {
          type: 'AKTIVITET_IKKE_MULIG'
          fom: string
          tom: string | null
          medisinskArsak: NySykmeldingMedisinskArsak
          arbeidsrelatertArsak: NySykmeldingArbeidsrelatertArsak
      }
    | {
          type: 'GRADERT'
          fom: string
          tom: string | null
          grad: number | null
      }

type NySykmeldingMedisinskArsak = {
    isMedisinskArsak: boolean | null
}

type NySykmeldingArbeidsrelatertArsak = {
    isArbeidsrelatertArsak: boolean | null
    arbeidsrelaterteArsaker: ArbeidsrelatertArsakType[] | null
    annenArbeidsrelatertArsak: string | null
}

export type NySykmeldingTilbakedatering = {
    fom: string
    grunn: TilbakedateringGrunn
    annenGrunn: string | null
}

export type NySykmeldingMeldinger = {
    showTilNav: boolean | null
    showTilArbeidsgiver: boolean | null
    tilNav: string | null
    tilArbeidsgiver: string | null
}

export type NySykmeldingDiagnoser = {
    hoved: Diagnose
    bi: Diagnose[]
}

export type NySykmeldingAndreSporsmal = {
    svangerskapsrelatert: boolean
    yrkesskade: boolean
    yrkesskadeDato: string | null
}

export type NySykmeldingUtdypendeSporsmal = {
    utfodringerMedArbeid: string | null
    medisinskOppsummering: string | null
    hensynPaArbeidsplassen: string | null
}

export type NySykmeldingFormState = {
    arbeidsforhold: NySykmeldingArbeidsforhold | null
    aktiviteter: NySykmeldingAktivitet[] | null
    tilbakedatering: NySykmeldingTilbakedatering | null
    diagnose: NySykmeldingDiagnoser | null
    meldinger: NySykmeldingMeldinger | null
    andreSporsmal: NySykmeldingAndreSporsmal | null
    utdypendeSporsmal: NySykmeldingUtdypendeSporsmal | null
}

export type NySykmeldingFormPayload = {
    arbeidsforhold: NySykmeldingArbeidsforhold | null
    diagnose: NySykmeldingDiagnoser
    aktiviteter: NySykmeldingAktivitet[]
    tilbakedatering: NySykmeldingTilbakedatering | null
    meldinger: NySykmeldingMeldinger
    andreSporsmal: NySykmeldingAndreSporsmal
    utdypendeSporsmal: NySykmeldingUtdypendeSporsmal | null
}
