import React, { ReactElement } from 'react'

import { DupliserSykmeldingFormWithDefaultValues } from '@features/actions/dupliser-sykmelding/DupliserSykmelding'
import NySykmeldingPageSteps from '@features/ny-sykmelding-form/NySykmeldingPageSteps'
import { StaticPageHeading } from '@components/layout/Page'

async function Page({ params }: PageProps<'/fhir/dupliser/[sykmeldingId]'>): Promise<ReactElement> {
    const sykmeldingId = (await params).sykmeldingId

    return (
        <NySykmeldingPageSteps heading={<StaticPageHeading>Ny sykmelding (utkast)</StaticPageHeading>}>
            <DupliserSykmeldingFormWithDefaultValues sykmeldingId={sykmeldingId} />
        </NySykmeldingPageSteps>
    )
}

export default Page
