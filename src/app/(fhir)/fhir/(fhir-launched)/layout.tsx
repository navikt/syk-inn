import { PropsWithChildren, ReactElement } from 'react'

import FhirDataProvider from '@data-layer/fhir/components/FhirDataProvider'
import { serverFhirResources } from '@data-layer/fhir/fhir-data-server'

export async function LaunchedFhirAppLayout({ children }: PropsWithChildren): Promise<ReactElement> {
    const behandler = await serverFhirResources.getBehandlerInfo()

    return <FhirDataProvider behandler={behandler}>{children}</FhirDataProvider>
}

export default LaunchedFhirAppLayout
