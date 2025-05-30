'use client'

import React, { PropsWithChildren, ReactElement } from 'react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { ApolloNextAppProvider } from '@apollo/client-integration-nextjs'

import { Toggles } from '@toggles/toggles'
import { ToggleProvider } from '@toggles/context'
import { makeApolloClient } from '@graphql/apollo/apollo-client'

import StoreProvider from './redux/StoreProvider'
import { ModeProvider, Modes } from './ModeProvider'

function Providers({ children, toggles, mode }: PropsWithChildren<{ toggles: Toggles; mode: Modes }>): ReactElement {
    return (
        <ApolloNextAppProvider makeClient={makeApolloClient}>
            <StoreProvider>
                <ToggleProvider toggles={toggles}>
                    <ModeProvider mode={mode}>
                        <NuqsAdapter>{children}</NuqsAdapter>
                    </ModeProvider>
                </ToggleProvider>
            </StoreProvider>
        </ApolloNextAppProvider>
    )
}

export default Providers
