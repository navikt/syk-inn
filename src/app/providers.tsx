'use client'

import React, { PropsWithChildren, ReactElement } from 'react'
import { logger } from '@navikt/next-logger'

function Providers({ children }: PropsWithChildren): ReactElement {
    logger.info('Hello from page (providers)')

    return <>{children}</>
}

export default Providers
