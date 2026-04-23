import { createSlice } from '@reduxjs/toolkit'

type MetadataState = {
    sessionExpired: boolean
    dismissedWelcome: boolean
}

const initialState: MetadataState = {
    sessionExpired: false,
    /* Let's assume most users are returning users, and have seen the modal */
    dismissedWelcome: true,
}

const metadataSlice = createSlice({
    name: 'metadata',
    initialState: initialState,
    reducers: {
        setSessionExpired: (state) => {
            state.sessionExpired = true
        },
        dismissWelcome: (state) => {
            state.dismissedWelcome = true
        },
        openWelcome: (state) => {
            state.dismissedWelcome = false
        },
    },
})

export const metadataActions = metadataSlice.actions
export const metadataReducer = metadataSlice.reducer
