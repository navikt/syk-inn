/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { configureStore } from '@reduxjs/toolkit'

import { nySykmeldingReducer } from './reducers/ny-sykmelding'
import { metadataReducer } from './reducers/metadata'

export const makeStore = () => {
    return configureStore({
        reducer: {
            nySykmelding: nySykmeldingReducer,
            metadata: metadataReducer,
        },
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
