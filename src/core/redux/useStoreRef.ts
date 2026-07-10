'use client'

import { useRef } from 'react'

import { AutoPatient } from './reducers/ny-sykmelding/patient'
import { makeStore, AppStore } from './store'

export default function useStoreRef(patient?: AutoPatient): AppStore {
    const storeRef = useRef<AppStore>(undefined)
    if (!storeRef.current) {
        storeRef.current = makeStore(patient)
    }

    return storeRef.current
}
