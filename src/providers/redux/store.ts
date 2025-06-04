/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { configureStore } from '@reduxjs/toolkit'

import nySykmeldingMultistepReducer from './reducers/ny-sykmelding-multistep'
import metadataReducer from './reducers/metadata'

export const makeStore = () => {
    return configureStore({
        reducer: {
            nySykmeldingMultistep: nySykmeldingMultistepReducer,
            metadata: metadataReducer,
        },
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
