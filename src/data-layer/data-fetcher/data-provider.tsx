import { createContext, PropsWithChildren, ReactElement, useContext } from 'react'

import { isLocalOrDemo } from '@utils/env'

import { withFailInterceptor } from '../../devtools/api-fail-toggle/useAPIOverride'

import { DataService } from './data-service'

const DataProviderContext = createContext<DataService | null>(null)

/**
 * Actual provider for specific implementation of DataService for the app. In demo and local development
 * an interceptor is used to interact with DevTools for overriding whether a specific API fails or not.
 */
export function DataProvider({ dataService, children }: PropsWithChildren<{ dataService: DataService }>): ReactElement {
    const wrappedDataService: DataService = isLocalOrDemo ? withFailInterceptor(dataService) : dataService

    return <DataProviderContext.Provider value={wrappedDataService}>{children}</DataProviderContext.Provider>
}

export function useDataService(): DataService {
    const adapter = useContext(DataProviderContext)

    if (adapter === null) {
        throw new Error('useNySykmeldingDataService must be used within a NySykmeldingFormDataProvider')
    }

    return adapter
}

export function useIsDataServiceInitialized(): boolean {
    return useContext(DataProviderContext) !== null
}
