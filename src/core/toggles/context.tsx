'use client'

import { ReactElement, createContext, PropsWithChildren, useContext } from 'react'

import { raise } from '@lib/ts'

import { ExpectedToggles, Toggle, Toggles } from './toggles'

const FlagContext = createContext<{ toggles: Toggles }>({ toggles: [] })

export function ToggleProvider({ toggles, children }: PropsWithChildren<{ toggles: Toggles }>): ReactElement {
    if (toggles == null) {
        raise('Toggles are null, but required')
    }

    return <FlagContext.Provider value={{ toggles: toggles ?? [] }}>{children}</FlagContext.Provider>
}

export function useFlag(name: ExpectedToggles): Toggle {
    const context = useContext(FlagContext)
    const toggle = context.toggles.find((toggle) => toggle.name === name)

    if (toggle == null) {
        return { name, enabled: false, impressionData: false, variant: { name: 'disabled', enabled: false } }
    }

    return toggle
}
