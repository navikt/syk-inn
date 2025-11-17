'use client'

import React, { PropsWithChildren, ReactElement, useState } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Provider as ReduxProvider } from 'react-redux'
import { Toaster } from 'sonner'
import { ApolloProvider } from '@apollo/client/react'

import { makeApolloClient } from '@data-layer/graphql/apollo/apollo-client'
import { AutoPatient } from '@core/redux/reducers/ny-sykmelding/patient'
import { useMode } from '@core/providers/Modes'

import useStoreRef from '../redux/useStoreRef'

function Providers({ children, patient }: PropsWithChildren<{ patient?: AutoPatient }>): ReactElement {
    const mode = useMode()
    const store = useStoreRef(patient)
    const [client] = useState(makeApolloClient(store, mode.type, mode.paths.graphql))

    return (
        <ApolloProvider client={client}>
            <ReduxProvider store={store}>
                <NuqsAdapter>
                    {children}
                    <Toaster position="bottom-right" />
                </NuqsAdapter>
            </ReduxProvider>
        </ApolloProvider>
    )
}

export default Providers
