import type { PayloadAction } from '@reduxjs/toolkit'
import { createSlice } from '@reduxjs/toolkit'

import { BehandlerSummaryMeta } from './behandler'
import { NySykmeldingFormPayload, NySykmeldingFormState } from './form'
import { ActivePatient, AutoPatient, ManualPatient } from './patient'
import { SummarySectionValues } from './summary'

export type NySykmeldingState = {
    pasient: ActivePatient | null
    values: NySykmeldingFormState | null
    summary: SummarySectionValues | null
    behandler: BehandlerSummaryMeta | null
}

const initialState: NySykmeldingState = {
    pasient: null,
    values: null,
    summary: null,
    behandler: null,
}

export function createPreloadedPatientState(patient: AutoPatient): NySykmeldingState {
    return {
        ...initialState,
        pasient: patient,
    }
}

export const nySykmeldingSlice = createSlice({
    name: 'ny-sykmelding-multistep',
    initialState,
    reducers: {
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
        overrideBehandlerOrganisasjonsnummmer(state, action: PayloadAction<string>) {
            if (state.behandler == null) state.behandler = { organisasjonsnummer: action.payload, legekontorTlf: null }

            state.behandler.organisasjonsnummer = action.payload
        },
        overrideBehandlerLegekontorTlf(state, action: PayloadAction<string>) {
            if (state.behandler == null) state.behandler = { organisasjonsnummer: null, legekontorTlf: action.payload }

            state.behandler.legekontorTlf = action.payload
        },
        reset(state) {
            // Don't nuke patient or behandler
            state.values = null
            state.summary = null
        },
    },
})
