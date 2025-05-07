import { PropsWithChildren, ReactElement } from 'react'

import FhirDataProvider from '@fhir/components/FhirDataProvider'
import { serverFhirResources } from '@fhir/fhir-data/fhir-data-server'

export async function LaunchedFhirAppLayout({ children }: PropsWithChildren): Promise<ReactElement> {
    const behandler = await serverFhirResources.getBehandlerInfo()

    return <FhirDataProvider behandler={behandler}>{children}</FhirDataProvider>
}

export default LaunchedFhirAppLayout
