'use client'

import { Page, PageBlock } from '@navikt/ds-react/Page'
import React, { ReactElement } from 'react'
import { Heading, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client'

import OpprettNySykmeldingCard from '@features/dashboard/OpprettNySykmeldingCard'
import { KonsultasjonDocument, PasientDocument } from '@queries'
import ComboTableCard from '@features/dashboard/ComboTableCard'

function DashboardPage(): ReactElement {
    const pasientQuery = useQuery(PasientDocument)

    // Preload Konsultasjon (with diagnosis) for the form
    useQuery(KonsultasjonDocument)

    return (
        <Page className="bg-transparent">
            <PageBlock as="main" gutters className="pt-4">
                <Heading level="2" size="medium" spacing>
                    <span>Oversikt over</span>
                    {pasientQuery.loading && <Skeleton width={140} className="inline-block mx-2" />}
                    {pasientQuery.data?.pasient && ` ${pasientQuery.data.pasient.navn} `}
                    <span>sitt sykefravær</span>
                </Heading>

                <div className="grid grid-cols-2 -mx-4 gap-3">
                    <OpprettNySykmeldingCard className="col-span-2" />
                    <ComboTableCard className="col-span-2" />
                </div>
            </PageBlock>
        </Page>
    )
}

export default DashboardPage
