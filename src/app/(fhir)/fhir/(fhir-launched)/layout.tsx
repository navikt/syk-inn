import { PropsWithChildren, ReactElement } from 'react'

import FhirDataProvider from '@data-layer/fhir/components/FhirDataProvider'
import { getPractitioner } from '@data-layer/fhir/fhir-engine'
import { practitionerToBehandler } from '@data-layer/fhir/mappers/practitioner'

export async function LaunchedFhirAppLayout({ children }: PropsWithChildren): Promise<ReactElement> {
    const practitioner = await getPractitioner()

    return <FhirDataProvider behandler={practitionerToBehandler(practitioner)}>{children}</FhirDataProvider>
}

export default LaunchedFhirAppLayout
