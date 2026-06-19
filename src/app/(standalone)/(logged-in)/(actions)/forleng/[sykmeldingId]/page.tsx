import React, { ReactElement } from 'react'

import { StaticPageHeading } from '#components/layout/Page'
import { ForlengSykmeldingFormWithDefaultValues } from '#features/actions/forleng-sykmelding/ForlengSykmelding'
import NySykmeldingPageSteps from '#features/ny-sykmelding-form/NySykmeldingPageSteps'

async function Page({ params }: PageProps<'/forleng/[sykmeldingId]'>): Promise<ReactElement> {
    const sykmeldingId = (await params).sykmeldingId

    return (
        <NySykmeldingPageSteps heading={<StaticPageHeading>Ny sykmelding (forlengelse)</StaticPageHeading>}>
            <ForlengSykmeldingFormWithDefaultValues sykmeldingId={sykmeldingId} />
        </NySykmeldingPageSteps>
    )
}

export default Page
