'use client'

import React, { PropsWithChildren, ReactElement } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs'
import { Provider as ReduxProvider } from 'react-redux'
import { Toaster } from 'sonner'

import { makeApolloClient } from '@graphql/apollo/apollo-client'

import { ModeProvider, Modes } from './ModeProvider'
import useStoreRef from './redux/useStoreRef'

function Providers({ children, mode }: PropsWithChildren<{ mode: Modes }>): ReactElement {
    const store = useStoreRef()

    return (
        <ApolloNextAppProvider makeClient={makeApolloClient(store)}>
            <ReduxProvider store={store}>
                <ModeProvider mode={mode}>
                    <NuqsAdapter>
                        {children}
                        <Toaster position="bottom-center" />
                    </NuqsAdapter>
                </ModeProvider>
            </ReduxProvider>
        </ApolloNextAppProvider>
    )
}

export default Providers
