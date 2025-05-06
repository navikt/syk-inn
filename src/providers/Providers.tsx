'use client'

import React, { PropsWithChildren, ReactElement } from 'react'
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query'
import { logger } from '@navikt/next-logger'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { Toggles } from '@toggles/toggles'
import { ToggleProvider } from '@toggles/context'

import StoreProvider from './redux/StoreProvider'

function Providers({ children, toggles }: PropsWithChildren<{ toggles: Toggles }>): ReactElement {
    const [queryClient] = React.useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        refetchOnMount: false,
                        refetchOnWindowFocus: false,
                    },
                },
                queryCache: new QueryCache({
                    onError: (error, query) => {
                        logger.error(
                            new Error(`Query failed, reason: ${error.message}, hash: ${query.queryHash}`, {
                                cause: error,
                            }),
                        )
                    },
                }),
            }),
    )

    return (
        <StoreProvider>
            <ToggleProvider toggles={toggles}>
                <NuqsAdapter>
                    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
                </NuqsAdapter>
            </ToggleProvider>
        </StoreProvider>
    )
}

export default Providers
