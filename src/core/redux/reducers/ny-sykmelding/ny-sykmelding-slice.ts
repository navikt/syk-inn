import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { NySykmeldingFormPayload, NySykmeldingFormState } from './form'
import { ActivePatient, AutoPatient, ManualPatient } from './patient'
import { SummarySectionValues } from './summary'

export type NySykmeldingState = {
    pasient: ActivePatient | null
    values: NySykmeldingFormState | null
    summary: SummarySectionValues | null
}

const initialState: NySykmeldingState = {
    pasient: null,
    values: null,
    summary: null,
}

export const nySykmeldingSlice = createSlice({
    name: 'ny-sykmelding-multistep',
    initialState,
    reducers: {
        activePatient(state, action: PayloadAction<AutoPatient>) {
            state.pasient = action.payload
        },
        manualPatient(state, action: PayloadAction<ManualPatient>) {
            state.pasient = action.payload
        },
        completeForm(state, action: PayloadAction<NySykmeldingFormPayload>) {
            state.values = action.payload
        },
        setSkalSkjermes(state, action: PayloadAction<boolean | null>) {
            if (state.summary == null) state.summary = { skalSkjermes: action.payload }

            state.summary.skalSkjermes = action.payload
        },
        reset(state) {
            // Don't nuke patient
            state.values = null
            state.summary = null
        },
    },
})
