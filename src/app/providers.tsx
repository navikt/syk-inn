'use client'

import React, { PropsWithChildren, ReactElement } from 'react'
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query'
import { configureLogger, logger } from '@navikt/next-logger'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { bundledEnv } from '@utils/env'

import { Toggles } from '../toggles/toggles'
import { ToggleProvider } from '../toggles/context'

configureLogger({
    basePath: bundledEnv.NEXT_PUBLIC_BASE_PATH ?? undefined,
})

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
        <ToggleProvider toggles={toggles}>
            <NuqsAdapter>
                <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </NuqsAdapter>
        </ToggleProvider>
    )
}

export default Providers
