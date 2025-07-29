import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { SykmeldingFragment } from '@queries'
import { NySykmeldingFormPayload, NySykmeldingFormState } from '@core/redux/reducers/ny-sykmelding/form'
import { ActivePatient, AutoPatient } from '@core/redux/reducers/ny-sykmelding/patient'
import { dupliserSykmelding } from '@core/redux/reducers/ny-sykmelding/mappers/duplisering'
import { forlengSykmelding } from '@core/redux/reducers/ny-sykmelding/mappers/forlengelse'

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
        completeForm(state, action: PayloadAction<NySykmeldingFormPayload>) {
            state.values = action.payload
        },
        dupliser(state, action: PayloadAction<SykmeldingFragment>) {
            state.values = dupliserSykmelding(action.payload)
        },
        forleng(state, action: PayloadAction<SykmeldingFragment>) {
            state.values = forlengSykmelding(action.payload)
        },
        setSkalSkjermes(state, action: PayloadAction<boolean | null>) {
            if (state.summary == null) state.summary = { skalSkjermes: action.payload }

            state.summary.skalSkjermes = action.payload
        },
        reset() {
            return initialState
        },
    },
})
