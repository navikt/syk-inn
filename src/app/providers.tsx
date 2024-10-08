'use client'

import React, { PropsWithChildren, ReactElement } from 'react'
import { QueryClient, QueryClientProvider, QueryCache } from '@tanstack/react-query'
import { logger } from '@navikt/next-logger'

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
                    onError: (error) => {
                        logger.error(error)
                    },
                }),
            }),
    )

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default Providers
