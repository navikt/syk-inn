'use client'

import { PropsWithChildren, ReactElement, useRef } from 'react'
import { Provider } from 'react-redux'

import { makeStore, AppStore } from './store'

export default function StoreProvider({ children }: PropsWithChildren): ReactElement {
    const storeRef = useRef<AppStore>(undefined)
    if (!storeRef.current) {
        storeRef.current = makeStore()
    }

    return <Provider store={storeRef.current}>{children}</Provider>
}
