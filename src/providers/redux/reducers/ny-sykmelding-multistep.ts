import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

type ManualPatientStep = {
    type: 'manual'
    fnr: string
}

type AutoPatientStep = {
    type: 'auto'
    fnr: string
}

type PasientStep = ManualPatientStep | AutoPatientStep | null

type NySykmeldingMultiStepState = {
    pasient: PasientStep
}

const initialState: NySykmeldingMultiStepState = {
    pasient: null,
}

const nySykmeldingMultistep = createSlice({
    name: 'ny-sykmelding-multistep',
    initialState,
    reducers: {
        autoPatient(state, action: PayloadAction<AutoPatientStep>) {
            state.pasient = action.payload
        },
        increment(state) {
            state.pasient = null
        },
    },
})

export const nySykmeldingMultistepActions = nySykmeldingMultistep.actions

export default nySykmeldingMultistep.reducer
