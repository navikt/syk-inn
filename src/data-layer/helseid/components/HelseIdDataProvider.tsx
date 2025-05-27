'use client'

import React, { PropsWithChildren, ReactElement } from 'react'

import { Behandler } from '@data-layer/resources'

import { DataProvider } from '../../data-fetcher/data-provider'
import { DataService } from '../../data-fetcher/data-service'
import { createHelseIdDataService } from '../helseid-data/helseid-data-service'

type Props = {
    behandler: Behandler
}

function HelseIdDataProvider({ behandler, children }: PropsWithChildren<Props>): ReactElement {
    const standaloneDataService: DataService = createHelseIdDataService(behandler)

    return <DataProvider dataService={standaloneDataService}>{children}</DataProvider>
}

export default HelseIdDataProvider
