import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

import { DiagnoseSuggestion } from '@components/form/diagnose-combobox/DiagnoseCombobox'

type ManualPatientStep = {
    type: 'manual'
    fnr: string
    navn: string
}

type AutoPatientStep = {
    type: 'auto'
    fnr: string
    navn: string
}

export type PasientStep = ManualPatientStep | AutoPatientStep

export type AktivitetStep = {
    fom: string
    tom: string
} & (
    | {
          type: 'AKTIVITET_IKKE_MULIG'
      }
    | { type: 'GRADERT'; grad: number }
)

export type MeldingerStep = {
    tilNav: string
    tilArbeidsgiver: string
}

export type DiagnoseStep = {
    hoved: DiagnoseSuggestion
    bi: DiagnoseSuggestion[]
}

type NySykmeldingMultiStepState = {
    pasient: PasientStep | null
    aktivitet: AktivitetStep | null
    diagnose: DiagnoseStep | null
    meldinger: MeldingerStep | null
}

const initialState: NySykmeldingMultiStepState = {
    pasient: null,
    aktivitet: null,
    diagnose: null,
    meldinger: null,
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
            action: PayloadAction<{ diagnose: DiagnoseStep; aktivitet: AktivitetStep; meldinger: MeldingerStep }>,
        ) {
            state.aktivitet = action.payload.aktivitet
            state.diagnose = action.payload.diagnose
            state.meldinger = action.payload.meldinger
        },
    },
})

export const nySykmeldingMultistepActions = nySykmeldingMultistep.actions

export default nySykmeldingMultistep.reducer
