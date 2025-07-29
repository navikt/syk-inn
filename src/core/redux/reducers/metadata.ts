import { createSlice } from '@reduxjs/toolkit'

type MetadataState = {
    sessionExpired: boolean
}

const initialState: MetadataState = {
    sessionExpired: false,
}

const metadataSlice = createSlice({
    name: 'metadata',
    initialState: initialState,
    reducers: {
        setSessionExpired: (state) => {
            state.sessionExpired = true
        },
    },
})

export const metadataActions = metadataSlice.actions
export const metadataReducer = metadataSlice.reducer
