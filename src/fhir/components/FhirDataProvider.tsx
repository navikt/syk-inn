'use client'

import React, { PropsWithChildren, ReactElement } from 'react'

import { createFhirDataService } from '../fhir-data/fhir-data-service'
import { BehandlerInfo } from '../../data-layer/data-fetcher/data-service'
import { DataProvider } from '../../data-layer/data-fetcher/data-provider'

type Props = {
    behandler: BehandlerInfo
}

function FhirDataProvider({ behandler, children }: PropsWithChildren<Props>): ReactElement {
    const fhirDataService = createFhirDataService(behandler)

    return <DataProvider dataService={fhirDataService}>{children}</DataProvider>
}

export default FhirDataProvider
