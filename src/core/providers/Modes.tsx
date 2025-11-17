'use client'

import React, { PropsWithChildren, ReactElement } from 'react'

export type ModeType = 'FHIR' | 'HelseID'

const ModeContext = React.createContext<ModeType>('FHIR')

export function ModeProvider({ mode, children }: PropsWithChildren<{ mode: ModeType }>): ReactElement {
    return <ModeContext.Provider value={mode}>{children}</ModeContext.Provider>
}

export function useMode(): { type: ModeType; paths: ModePaths } {
    const mode = React.useContext(ModeContext)
    if (!mode) {
        throw new Error('useMode must be used within a ModeProvider')
    }
    return { type: mode, paths: createModePaths(mode) }
}

type ModePaths = {
    graphql: `/${string}`
    root: `/${string}` | '/'
    kvittering: (id: string) => `/${string}`
    pdf: (id: string) => `/${string}`
}

export function createModePaths(mode: ModeType): ModePaths {
    switch (mode) {
        case 'FHIR':
            return {
                root: '/fhir',
                graphql: '/fhir/graphql',
                kvittering: (id) => `/fhir/kvittering/${id}`,
                pdf: (id) => `/fhir/pdf/${id}`,
            }
        case 'HelseID':
            return {
                root: '/',
                graphql: '/graphql',
                kvittering: (id) => `/kvittering/${id}`,
                pdf: (id) => `/pdf/${id}`,
            }
    }
}
