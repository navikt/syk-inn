import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { DiagnoseSuggestion } from '@components/form/diagnose-combobox/DiagnoseCombobox'
import { ArbeidsrelatertArsakType } from '@queries'

type ManualPatientStep = {
    type: 'manual'
    ident: string
    navn: string
}

type AutoPatientStep = {
    type: 'auto'
    ident: string
    navn: string
}

export type PasientStep = ManualPatientStep | AutoPatientStep

export type ArbeidsforholdStep = {
    harFlereArbeidsforhold: boolean | null
    sykmeldtFraArbeidsforhold: string | null
}

export type AktivitetStep =
    | {
          type: 'AKTIVITET_IKKE_MULIG'
          fom: string
          tom: string | null
          medisinskArsak: MedisinskArsak
          arbeidsrelatertArsak: ArbeidsrelatertArsak
      }
    | {
          type: 'GRADERT'
          fom: string
          tom: string | null
          grad: number | null
      }

export type MedisinskArsak = {
    isMedisinskArsak: boolean | null
}

export type ArbeidsrelatertArsak = {
    isArbeidsrelatertArsak: boolean | null
    arbeidsrelaterteArsaker: ArbeidsrelatertArsakType[] | null
    annenArbeidsrelatertArsak: string | null
}

export type TilbakedateringStep = {
    fom: string
    grunn: TilbakedateringGrunn
    annenGrunn: string | null
}

export type TilbakedateringGrunn =
    | 'VENTETID_LEGETIME'
    | 'MANGLENDE_SYKDOMSINNSIKT_GRUNNET_ALVORLIG_PSYKISK_SYKDOM'
    | 'ANNET'

export type MeldingerStep = {
    showTilNav: boolean | null
    showTilArbeidsgiver: boolean | null
    tilNav: string | null
    tilArbeidsgiver: string | null
}

export type DiagnoseStep = {
    hoved: DiagnoseSuggestion
    bi: DiagnoseSuggestion[]
}

export type AndreSporsmalStep = {
    svangerskapsrelatert: boolean
    yrkesskade: boolean
    yrkesskadeDato: string | null
}

export type MainSectionValues = {
    arbeidsforhold: ArbeidsforholdStep | null
    aktiviteter: AktivitetStep[] | null
    tilbakedatering: TilbakedateringStep | null
    diagnose: DiagnoseStep | null
    meldinger: MeldingerStep | null
    andreSporsmal: AndreSporsmalStep | null
}

export type NySykmeldingMultiStepState = {
    pasient: PasientStep | null
    values: MainSectionValues | null
    skalSkjermes: boolean | null
}

const initialState: NySykmeldingMultiStepState = {
    pasient: null,
    values: null,
    skalSkjermes: null,
}

const nySykmeldingMultistep = createSlice({
    name: 'ny-sykmelding-multistep',
    initialState,
    reducers: {
        autoPatient(state, action: PayloadAction<AutoPatientStep>) {
            state.pasient = action.payload
        },
        completeMainStep(
            state,
            action: PayloadAction<{
                arbeidsforhold: ArbeidsforholdStep | null
                diagnose: DiagnoseStep
                aktiviteter: AktivitetStep[]
                tilbakedatering: TilbakedateringStep | null
                meldinger: MeldingerStep
                andreSporsmal: AndreSporsmalStep
            }>,
        ) {
            state.values = action.payload
        },
        setSkalSkjermes(state, action: PayloadAction<boolean | null>) {
            state.skalSkjermes = action.payload
        },
        reset() {
            return initialState
        },
    },
})

export const nySykmeldingMultistepActions = nySykmeldingMultistep.actions

export default nySykmeldingMultistep.reducer
