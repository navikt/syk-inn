'use client'

import React, { PropsWithChildren, ReactElement } from 'react'

import { createFhirDataService } from '@data-layer/fhir/fhir-data-service'
import { Behandler } from '@data-layer/resources'

import { DataProvider } from '../../data-fetcher/data-provider'

type Props = {
    behandler: Behandler
}

function FhirDataProvider({ behandler, children }: PropsWithChildren<Props>): ReactElement {
    const fhirDataService = createFhirDataService(behandler)

    return <DataProvider dataService={fhirDataService}>{children}</DataProvider>
}

export default FhirDataProvider
