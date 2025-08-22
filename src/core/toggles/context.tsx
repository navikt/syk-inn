'use client'

import { ReactElement, createContext, PropsWithChildren, useContext } from 'react'

import { raise } from '@lib/ts'

import { ExpectedToggles, Toggles } from './toggles'

const FlagContext = createContext<{ toggles: Toggles | null }>({ toggles: null })

export function ToggleProvider({ toggles, children }: PropsWithChildren<{ toggles: Toggles }>): ReactElement {
    if (toggles == null) {
        raise('Toggles are null, but required')
    }

    return <FlagContext.Provider value={{ toggles: toggles ?? [] }}>{children}</FlagContext.Provider>
}

export function useFlag(name: ExpectedToggles): boolean {
    const context = useContext(FlagContext)
    if (context.toggles == null) {
        raise('Toggles context is not provided, are you using ToggleProvider?')
    }

    return context.toggles[name]
}
