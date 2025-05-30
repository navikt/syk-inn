'use client'

import { Page, PageBlock } from '@navikt/ds-react/Page'
import React, { ReactElement } from 'react'
import { Heading, Skeleton } from '@navikt/ds-react'
import { useQuery } from '@apollo/client'

import { FhirError } from '@fhir/components/FhirError'
import OpprettNySykmeldingCard from '@components/dashboard/OpprettNySykmeldingCard'
import PagaendeSykmeldingerCard from '@components/dashboard/PagaendeSykmeldingerCard'
import { PasientDocument } from '@queries'

function DashboardPage(): ReactElement {
    const pasientQuery = useQuery(PasientDocument)

    if (pasientQuery.error) {
        return <FhirError />
    }

    return (
        <Page className="bg-bg-subtle">
            <PageBlock as="main" gutters className="pt-4">
                <Heading level="2" size="medium" spacing>
                    <span>Oversikt over</span>
                    {pasientQuery.loading && <Skeleton width={140} className="inline-block mx-2" />}
                    {pasientQuery.data?.pasient && ` ${pasientQuery.data.pasient.navn} `}
                    <span>sitt sykefravær</span>
                </Heading>

                <div className="grid grid-cols-2 -mx-4 gap-3">
                    <OpprettNySykmeldingCard />
                    <PagaendeSykmeldingerCard />
                </div>
            </PageBlock>
        </Page>
    )
}

export default DashboardPage
