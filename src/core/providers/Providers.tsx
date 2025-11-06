'use client'

import React, { PropsWithChildren, ReactElement, useState } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { Provider as ReduxProvider } from 'react-redux'
import { Toaster } from 'sonner'
import { ApolloProvider } from '@apollo/client/react'

import { makeApolloClient } from '@data-layer/graphql/apollo/apollo-client'
import { AutoPatient } from '@core/redux/reducers/ny-sykmelding/patient'

import useStoreRef from '../redux/useStoreRef'

import { ModeType, ModeProvider } from './Modes'

function Providers({
    children,
    mode,
    patient,
}: PropsWithChildren<{ mode: ModeType; patient?: AutoPatient }>): ReactElement {
    const store = useStoreRef(patient)
    const [client] = useState(makeApolloClient(store, mode))

    return (
        <ApolloProvider client={client}>
            <ReduxProvider store={store}>
                <ModeProvider mode={mode}>
                    <NuqsAdapter>
                        {children}
                        <Toaster position="bottom-right" />
                    </NuqsAdapter>
                </ModeProvider>
            </ReduxProvider>
        </ApolloProvider>
    )
}

export default Providers
