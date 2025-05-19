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

type NySykmeldingMultiStepState = {
    pasient: PasientStep | null
    aktiviteter: AktivitetStep[] | null
    diagnose: DiagnoseStep | null
    meldinger: MeldingerStep | null
    andreSporsmal: AndreSporsmalStep | null
}

const initialState: NySykmeldingMultiStepState = {
    pasient: null,
    aktiviteter: null,
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
                meldinger: MeldingerStep
                andreSporsmal: AndreSporsmalStep
            }>,
        ) {
            state.aktiviteter = action.payload.aktiviteter
            state.diagnose = action.payload.diagnose
            state.meldinger = action.payload.meldinger
            state.andreSporsmal = action.payload.andreSporsmal
        },
    },
})

export const nySykmeldingMultistepActions = nySykmeldingMultistep.actions

export default nySykmeldingMultistep.reducer
