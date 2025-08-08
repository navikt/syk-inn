import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { SykmeldingFragment } from '@queries'

import { dupliserSykmelding } from './mappers/duplisering'
import { forlengSykmelding } from './mappers/forlengelse'
import { NySykmeldingFormPayload, NySykmeldingFormState } from './form'
import { ActivePatient, AutoPatient } from './patient'
import { SummarySectionValues } from './summary'
import { MetaState } from './meta'

export type NySykmeldingState = {
    pasient: ActivePatient | null
    values: NySykmeldingFormState | null
    summary: SummarySectionValues | null
    meta: MetaState | null
}

const initialState: NySykmeldingState = {
    pasient: null,
    values: null,
    summary: null,
    meta: null,
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
            const [formState, fromFom] = forlengSykmelding(action.payload)

            state.values = formState
            state.meta = { initialFom: fromFom }
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
