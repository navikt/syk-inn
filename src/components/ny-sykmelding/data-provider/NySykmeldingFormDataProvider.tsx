import { createContext, PropsWithChildren, ReactElement, useContext } from 'react'

import { NySykmeldingFormDataService } from './NySykmeldingFormDataService'

const NySykmeldingFormContext = createContext<NySykmeldingFormDataService | null>(null)

export function NySykmeldingFormDataProvider({
    dataService,
    children,
}: PropsWithChildren<{ dataService: NySykmeldingFormDataService }>): ReactElement {
    return <NySykmeldingFormContext.Provider value={dataService}>{children}</NySykmeldingFormContext.Provider>
}

export function useNySykmeldingDataService(): NySykmeldingFormDataService {
    const adapter = useContext(NySykmeldingFormContext)

    if (adapter === null) {
        throw new Error('useNySykmeldingDataService must be used within a NySykmeldingFormDataProvider')
    }

    return adapter
}

export function useIsNySykmeldingDataServiceInitialized(): boolean {
    return useContext(NySykmeldingFormContext) !== null
}
