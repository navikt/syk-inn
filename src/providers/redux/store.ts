/* eslint-disable @typescript-eslint/explicit-function-return-type */

import { configureStore } from '@reduxjs/toolkit'

import nySykmeldingMultistepReducer from './reducers/ny-sykmelding-multistep'

export const makeStore = () => {
    return configureStore({
        reducer: {
            nySykmeldingMultistep: nySykmeldingMultistepReducer,
        },
    })
}

export type AppStore = ReturnType<typeof makeStore>
export type RootState = ReturnType<AppStore['getState']>
export type AppDispatch = AppStore['dispatch']
