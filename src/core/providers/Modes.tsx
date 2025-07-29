import React, { PropsWithChildren, ReactElement } from 'react'

export type ModeType = 'FHIR' | 'HelseID'

const ModeContext = React.createContext<ModeType>('FHIR')

export function ModeProvider({ mode, children }: PropsWithChildren<{ mode: ModeType }>): ReactElement {
    return <ModeContext.Provider value={mode}>{children}</ModeContext.Provider>
}

export function useMode(): ModeType {
    const mode = React.useContext(ModeContext)
    if (!mode) {
        throw new Error('useMode must be used within a ModeProvider')
    }
    return mode
}
