'use client'

import React, { ReactElement } from 'react'
import { Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client'

import OpprettNySykmeldingCard from '@features/dashboard/OpprettNySykmeldingCard'
import { KonsultasjonDocument, PasientDocument } from '@queries'
import ComboTableCard from '@features/dashboard/ComboTableCard'
import { PageLayout } from '@components/layout/Page'

function DashboardPage(): ReactElement {
    const pasientQuery = useQuery(PasientDocument)

    // Preload Konsultasjon (with diagnosis) for the form
    useQuery(KonsultasjonDocument)

    return (
        <PageLayout
            heading={
                <>
                    <span>Oversikt over</span>
                    {pasientQuery.loading && <Skeleton width={140} className="inline-block mx-2" />}
                    {pasientQuery.data?.pasient && ` ${pasientQuery.data.pasient.navn} `}
                    <span>sitt sykefravær</span>
                </>
            }
        >
            <div className="grid grid-cols-2 gap-3">
                <OpprettNySykmeldingCard className="col-span-2" />
                <ComboTableCard className="col-span-2" />
            </div>
        </PageLayout>
    )
}

export default DashboardPage
