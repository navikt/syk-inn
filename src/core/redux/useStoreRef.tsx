'use client'

import { useRef } from 'react'

import { makeStore, AppStore } from './store'

export default function useStoreRef(): AppStore {
    const storeRef = useRef<AppStore>(undefined)
    if (!storeRef.current) {
        storeRef.current = makeStore()
    }

    return storeRef.current
}
