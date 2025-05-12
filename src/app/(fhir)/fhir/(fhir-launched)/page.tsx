'use client'

import { Page, PageBlock } from '@navikt/ds-react/Page'
import React, { ReactElement } from 'react'
import { Heading, Skeleton } from '@navikt/ds-react'

import OpprettNySykmeldingCard from '@components/dashboard/OpprettNySykmeldingCard'
import PagaendeSykmeldingerCard from '@components/dashboard/PagaendeSykmeldingerCard'

import { useContextPasient } from '../../../../data-fetcher/hooks/use-context-pasient'

function DashboardPage(): ReactElement {
    const pasient = useContextPasient()

    return (
        <Page className="bg-bg-subtle">
            <PageBlock as="main" gutters className="pt-4">
                <Heading level="2" size="medium" spacing>
                    <span>Oversikt over</span>
                    {pasient.isLoading && <Skeleton width={140} className="inline-block mx-2" />}
                    {pasient.isSuccess && pasient.data && ` ${pasient.data.navn} `}
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
