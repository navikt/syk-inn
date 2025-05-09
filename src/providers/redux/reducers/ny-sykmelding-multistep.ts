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

export type DiagnoseStep = {
    hoved: DiagnoseSuggestion
    bi: DiagnoseSuggestion[]
}

type NySykmeldingMultiStepState = {
    pasient: PasientStep | null
    aktivitet: AktivitetStep | null
    diagnose: DiagnoseStep | null
}

const initialState: NySykmeldingMultiStepState = {
    pasient: null,
    aktivitet: null,
    diagnose: null,
}

const nySykmeldingMultistep = createSlice({
    name: 'ny-sykmelding-multistep',
    initialState,
    reducers: {
        autoPatient(state, action: PayloadAction<AutoPatientStep>) {
            state.pasient = action.payload
        },
        completeAktivitet(state, action: PayloadAction<AktivitetStep>) {
            state.aktivitet = action.payload
        },
        completeDiagnose(state, action: PayloadAction<DiagnoseStep>) {
            state.diagnose = action.payload
        },
    },
})

export const nySykmeldingMultistepActions = nySykmeldingMultistep.actions

export default nySykmeldingMultistep.reducer
