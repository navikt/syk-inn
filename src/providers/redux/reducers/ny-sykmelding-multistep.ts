import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { DiagnoseSuggestion } from '@components/form/diagnose-combobox/DiagnoseCombobox'

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

export type AktivitetStep =
    | {
          type: 'AKTIVITET_IKKE_MULIG'
          fom: string
          tom: string
      }
    | {
          type: 'GRADERT'
          fom: string
          tom: string
          grad: number
      }

export type TilbakedateringStep = {
    fom: string
    grunn: string
}

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
}

export type NySykmeldingMultiStepState = {
    pasient: PasientStep | null
    aktiviteter: AktivitetStep[] | null
    tilbakedatering: TilbakedateringStep | null
    diagnose: DiagnoseStep | null
    meldinger: MeldingerStep | null
    andreSporsmal: AndreSporsmalStep | null
}

const initialState: NySykmeldingMultiStepState = {
    pasient: null,
    aktiviteter: null,
    tilbakedatering: null,
    diagnose: null,
    meldinger: null,
    andreSporsmal: null,
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
                diagnose: DiagnoseStep
                aktiviteter: AktivitetStep[]
                tilbakedatering: TilbakedateringStep | null
                meldinger: MeldingerStep
                andreSporsmal: AndreSporsmalStep
            }>,
        ) {
            state.aktiviteter = action.payload.aktiviteter
            state.tilbakedatering = action.payload.tilbakedatering
            state.diagnose = action.payload.diagnose
            state.meldinger = action.payload.meldinger
            state.andreSporsmal = action.payload.andreSporsmal
        },
    },
})

export const nySykmeldingMultistepActions = nySykmeldingMultistep.actions

export default nySykmeldingMultistep.reducer
