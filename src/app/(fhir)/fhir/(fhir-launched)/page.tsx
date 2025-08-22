'use client'

import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'

import OpprettNySykmeldingCard from '@features/dashboard/OpprettNySykmeldingCard'
import { KonsultasjonDocument, PasientDocument } from '@queries'
import ComboTableCard from '@features/dashboard/ComboTableCard'
import { LoadablePageHeader, PageLayout } from '@components/layout/Page'

function DashboardPage(): ReactElement {
    const pasientQuery = useQuery(PasientDocument)

    // Preload Konsultasjon (with diagnosis) for the form
    useQuery(KonsultasjonDocument)

    return (
        <PageLayout
            heading={
                <LoadablePageHeader
                    lead="Oversikt over"
                    value={pasientQuery.data?.pasient?.navn ?? null}
                    tail="sitt sykefravær"
                />
            }
            size="full"
            bg="transparent"
        >
            <div className="grid grid-cols-2 gap-3 w-full">
                <OpprettNySykmeldingCard className="col-span-2" />
                <ComboTableCard className="col-span-2" />
            </div>
        </PageLayout>
    )
}

export default DashboardPage
