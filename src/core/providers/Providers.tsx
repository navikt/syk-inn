'use client'

import { ApolloProvider } from '@apollo/client/react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import React, { PropsWithChildren, ReactElement, useState } from 'react'
import { Provider as ReduxProvider } from 'react-redux'
import { Toaster } from 'sonner'

import { makeApolloClient } from '../data-layer/graphql/apollo/apollo-client'
import { AutoPatient } from '../redux/reducers/ny-sykmelding/patient'
import useStoreRef from '../redux/useStoreRef'

import { useMode } from './Modes'

function Providers({
    children,
    patient,
    graphqlPath,
}: PropsWithChildren<{ patient?: AutoPatient; graphqlPath: `/${string}` }>): ReactElement {
    const mode = useMode()
    const store = useStoreRef(patient)
    const [client] = useState(makeApolloClient(store, mode.type, graphqlPath))

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
