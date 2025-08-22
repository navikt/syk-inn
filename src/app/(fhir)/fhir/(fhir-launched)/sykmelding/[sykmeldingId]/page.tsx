'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'
import Link from 'next/link'

import { PasientDocument } from '@queries'
import { LoadablePageHeader, PageLayout } from '@components/layout/Page'
import { TidligereSykmelding } from '@features/tidligere-sykmelding/TidligereSykmelding'

function SykmeldingPage(): ReactElement {
    const pasientQuery = useQuery(PasientDocument)

    return (
        <PageLayout
            heading={<LoadablePageHeader lead="Sykmelding for" value={pasientQuery.data?.pasient?.navn ?? null} />}
            bg="white"
            size="fit"
        >
            <TidligereSykmelding />
            <div className="mx-4 flex justify-end p-4">
                <Link href="/fhir">Lukk</Link>
            </div>
        </PageLayout>
    )
}

export default SykmeldingPage
