import { createContext, PropsWithChildren, ReactElement, useContext } from 'react'

import { isLocalOrDemo } from '@utils/env'

import { useWithFailInterceptor } from '../../../devtools/useAPIOverride'

import { NySykmeldingFormDataService } from './NySykmeldingFormDataService'

const NySykmeldingFormContext = createContext<NySykmeldingFormDataService | null>(null)

/**
 * Actual provider for specific implementation of NySykmeldingFormDataService for the form. In demo and local development
 * an interceptor is used to interact with DevTools for overriding whether a specific API fails or not.
 */
export function NySykmeldingFormDataProvider({
    dataService,
    children,
}: PropsWithChildren<{ dataService: NySykmeldingFormDataService }>): ReactElement {
    const wrappedDataService: NySykmeldingFormDataService = isLocalOrDemo
        ? // Conditional statement is build time, which makes it fine
          // eslint-disable-next-line react-hooks/rules-of-hooks
          useWithFailInterceptor(dataService)
        : dataService

    return <NySykmeldingFormContext.Provider value={wrappedDataService}>{children}</NySykmeldingFormContext.Provider>
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
