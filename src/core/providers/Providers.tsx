'use client'

import React, { PropsWithChildren, ReactElement } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs'
import { Provider as ReduxProvider } from 'react-redux'
import { Toaster } from 'sonner'

import { makeApolloClient } from '@data-layer/graphql/apollo/apollo-client'

import useStoreRef from '../redux/useStoreRef'

import { ModeType, ModeProvider } from './Modes'

function Providers({ children, mode }: PropsWithChildren<{ mode: ModeType }>): ReactElement {
    const store = useStoreRef()

    return (
        <ApolloNextAppProvider makeClient={makeApolloClient(store)}>
            <ReduxProvider store={store}>
                <ModeProvider mode={mode}>
                    <NuqsAdapter>
                        {children}
                        <Toaster position="bottom-right" />
                    </NuqsAdapter>
                </ModeProvider>
            </ReduxProvider>
        </ApolloNextAppProvider>
    )
}

export default Providers
