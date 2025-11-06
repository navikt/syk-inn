/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { configureStore } from '@reduxjs/toolkit'

import { createPreloadedPatientState } from './reducers/ny-sykmelding/ny-sykmelding-slice'
import { AutoPatient } from './reducers/ny-sykmelding/patient'
import { nySykmeldingReducer } from './reducers/ny-sykmelding'
import { metadataReducer } from './reducers/metadata'

export const makeStore = (patient?: AutoPatient) => {
    return configureStore({
        reducer: {
            nySykmelding: nySykmeldingReducer,
            metadata: metadataReducer,
        },
        preloadedState: patient ? { nySykmelding: createPreloadedPatientState(patient) } : undefined,
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
