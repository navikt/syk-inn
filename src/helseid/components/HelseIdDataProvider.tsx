'use client'

import React, { PropsWithChildren, ReactElement } from 'react'

import { DataProvider } from '../../data-layer/data-fetcher/data-provider'
import { BehandlerInfo, DataService } from '../../data-layer/data-fetcher/data-service'
import { createHelseIdDataService } from '../helseid-data/helseid-data-service'

type Props = {
    behandler: BehandlerInfo
}

function HelseIdDataProvider({ behandler, children }: PropsWithChildren<Props>): ReactElement {
    const standaloneDataService: DataService = createHelseIdDataService(behandler)

    return <DataProvider dataService={standaloneDataService}>{children}</DataProvider>
}

export default HelseIdDataProvider
