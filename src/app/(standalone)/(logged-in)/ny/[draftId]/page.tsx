'use client'

import React, { ReactElement } from 'react'

import { StaticPageHeading } from '@components/layout/Page'
import NySykmeldingPageSteps from '@features/ny-sykmelding-form/NySykmeldingPageSteps'
import { NySykmeldingFormWithDraftAndSuggestions } from '@features/ny-sykmelding-form/NySykmeldingFormWithData'

function Page(): ReactElement {
    return (
        <NySykmeldingPageSteps heading={<StaticPageHeading>Ny sykmelding</StaticPageHeading>}>
            <NySykmeldingFormWithDraftAndSuggestions />
        </NySykmeldingPageSteps>
    )
}

export default Page
