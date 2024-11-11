'use client'

import React, { PropsWithChildren, ReactElement } from 'react'
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query'
import { configureLogger, logger } from '@navikt/next-logger'
import { NuqsAdapter } from 'nuqs/adapters/next/app'

import { bundledEnv } from '@utils/env'

configureLogger({
    basePath: bundledEnv.NEXT_PUBLIC_BASE_PATH ?? undefined,
})

function Providers({ children }: PropsWithChildren): ReactElement {
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
        <NuqsAdapter>
            <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        </NuqsAdapter>
    )
}

export default Providers
