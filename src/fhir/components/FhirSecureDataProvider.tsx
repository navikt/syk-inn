'use client'

import React, { PropsWithChildren, ReactElement } from 'react'

import { createSecureFhirDataService } from '@fhir/fhir-data-secure/fhir-data-secure-service'

import { BehandlerInfo } from '../../data-fetcher/data-service'
import { DataProvider } from '../../data-fetcher/data-provider'

type Props = {
    behandler: BehandlerInfo
}

function FhirSecureDataProvider({ behandler, children }: PropsWithChildren<Props>): ReactElement {
    const secureFhirDataService = createSecureFhirDataService(behandler)

    return <DataProvider dataService={secureFhirDataService}>{children}</DataProvider>
}

export default FhirSecureDataProvider
