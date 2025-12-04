'use client'

import React, { PropsWithChildren, ReactElement } from 'react'

import { createFhirPaths, HelseIdPaths, ModePaths, ModeType } from '@core/providers/ModePaths'

const ModeContext = React.createContext<{ type: ModeType; paths: ModePaths } | null>(null)

export function FhirModeProvider({
    activePatientId,
    children,
}: PropsWithChildren<{ activePatientId: string }>): ReactElement {
    return (
        <ModeContext.Provider value={{ type: 'FHIR', paths: createFhirPaths(activePatientId) }}>
            {children}
        </ModeContext.Provider>
    )
}

export function HelseIdModeProvider({ children }: PropsWithChildren): ReactElement {
    return <ModeContext.Provider value={{ type: 'HelseID', paths: HelseIdPaths }}>{children}</ModeContext.Provider>
}

export function useMode(): { type: ModeType; paths: ModePaths } {
    const mode = React.useContext(ModeContext)
    if (!mode) {
        throw new Error('useMode must be used within a ModeProvider')
    }
    return mode
}
