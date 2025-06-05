'use client'

import React, { PropsWithChildren, ReactElement } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs'
import { Provider as ReduxProvider } from 'react-redux'
import { Toaster } from 'sonner'

import { Toggles } from '@toggles/toggles'
import { ToggleProvider } from '@toggles/context'
import { makeApolloClient } from '@graphql/apollo/apollo-client'

import { ModeProvider, Modes } from './ModeProvider'
import useStoreRef from './redux/useStoreRef'

function Providers({ children, toggles, mode }: PropsWithChildren<{ toggles: Toggles; mode: Modes }>): ReactElement {
    const store = useStoreRef()

    return (
        <ApolloNextAppProvider makeClient={makeApolloClient(store)}>
            <ReduxProvider store={store}>
                <ToggleProvider toggles={toggles}>
                    <ModeProvider mode={mode}>
                        <NuqsAdapter>
                            {children}
                            <Toaster />
                        </NuqsAdapter>
                    </ModeProvider>
                </ToggleProvider>
            </ReduxProvider>
        </ApolloNextAppProvider>
    )
}

export default Providers
