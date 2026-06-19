'use client'

import { useQuery } from '@apollo/client/react'
import React, { ReactElement } from 'react'

import { LoadablePageHeader, PageLayout } from '#components/layout/Page'
import { TidligereSykmelding } from '#features/tidligere-sykmelding/TidligereSykmelding'
import { PasientDocument } from '#queries'

function SykmeldingPage(): ReactElement {
    const pasientQuery = useQuery(PasientDocument)

    return (
        <PageLayout
            heading={<LoadablePageHeader lead="Sykmelding for" value={pasientQuery.data?.pasient?.navn ?? null} />}
            bg="transparent"
            size="fit"
        >
            <TidligereSykmelding />
        </PageLayout>
    )
}

export default SykmeldingPage
