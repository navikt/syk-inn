'use client'

import React, { PropsWithChildren, ReactElement } from 'react'
import { logger } from '@navikt/next-logger'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

function Providers({ children }: PropsWithChildren): ReactElement {
    logger.info('Hello from page (providers)')

    const [queryClient] = React.useState(() => new QueryClient())

    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}

export default Providers
