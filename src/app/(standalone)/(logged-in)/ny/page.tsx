'use client'

import React, { ReactElement } from 'react'

import { StaticPageHeading } from '@components/layout/Page'
import NySykmeldingPageSteps from '@features/ny-sykmelding-form/NySykmeldingPageSteps'
import NySykmelding from '@features/actions/ny-sykmelding/NySykmelding'

function Page(): ReactElement {
    return (
        <NySykmeldingPageSteps heading={<StaticPageHeading>Ny sykmelding</StaticPageHeading>}>
            <NySykmelding />
        </NySykmeldingPageSteps>
    )
}

export default Page
