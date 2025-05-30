import React, { PropsWithChildren, ReactElement } from 'react'

export type Modes = 'FHIR' | 'HelseID'

const ModeContext = React.createContext<Modes>('FHIR')

export function ModeProvider({ mode, children }: PropsWithChildren<{ mode: Modes }>): ReactElement {
    return <ModeContext.Provider value={mode}>{children}</ModeContext.Provider>
}

export function useMode(): Modes {
    const mode = React.useContext(ModeContext)
    if (!mode) {
        throw new Error('useMode must be used within a ModeProvider')
    }
    return mode
}
