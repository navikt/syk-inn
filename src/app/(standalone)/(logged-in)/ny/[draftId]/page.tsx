'use client'

import React, { ReactElement } from 'react'

import { StaticPageHeading } from '@components/layout/Page'
import NySykmeldingPageSteps from '@features/ny-sykmelding-form/NySykmeldingPageSteps'

function Page(): ReactElement {
    return <NySykmeldingPageSteps heading={<StaticPageHeading>Ny sykmelding</StaticPageHeading>} />
}

export default Page
