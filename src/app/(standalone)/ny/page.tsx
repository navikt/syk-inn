'use client'

import React, { ReactElement } from 'react'

import NySykmeldingFormWithData from '@features/ny-sykmelding-form/NySykmeldingFormWithData'
import { PageLayout } from '@components/layout/Page'

function Page(): ReactElement {
    return (
        <PageLayout heading="Opprett ny sykmelding" bg="white" size="fit">
            <NySykmeldingFormWithData />
        </PageLayout>
    )
}

export default Page
