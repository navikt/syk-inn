import React, { ReactElement } from 'react'
import { Alert, BodyShort, Heading } from '@navikt/ds-react'
import { useQuery } from '@apollo/client/react'
import { NetworkStatus } from '@apollo/client'
import { FlowerPetalsIcon } from '@navikt/aksel-icons'

import DashboardCard from '@features/dashboard/card/DashboardCard'
import { AllDashboardDocument, KonsultasjonDocument } from '@queries'
import { ComboTable, ComboTableFullCell } from '@features/dashboard/combo-table/ComboTable'
import { RequestSykmeldinger } from '@features/dashboard/historical/RequestSykmeldinger'

function HistoricalCard({ className }: { className?: string }): ReactElement {
    const konsultasjon = useQuery(KonsultasjonDocument)
    const dashboardQuery = useQuery(AllDashboardDocument)

    const hasRequested = konsultasjon.data?.konsultasjon?.hasRequestedAccessToSykmeldinger
    const isRefetching =
        konsultasjon.networkStatus === NetworkStatus.refetch || dashboardQuery.networkStatus === NetworkStatus.refetch
    const initialLoad =
        konsultasjon.networkStatus === NetworkStatus.loading || dashboardQuery.networkStatus === NetworkStatus.loading
    const hasSykmeldinger = !!dashboardQuery.data?.sykmeldinger?.historical.length

    return (
        <DashboardCard
            heading={
                <Heading size="small" level="3" id="historical-card-heading">
                    Historiske sykmeldinger
                </Heading>
            }
            headingId="historical-card-heading"
            className={className}
            fetching={isRefetching}
        >
            {hasSykmeldinger && hasRequested && dashboardQuery.data && (
                <ComboTable sykmeldinger={dashboardQuery.data.sykmeldinger?.historical ?? []} drafts={[]}>
                    {dashboardQuery.error && !dashboardQuery.data.sykmeldinger == null && (
                        <HistoricalSykmeldingerError />
                    )}
                </ComboTable>
            )}
            {!konsultasjon.error && !hasRequested && <RequestSykmeldinger loading={initialLoad} />}
            {!konsultasjon.error && hasRequested && !hasSykmeldinger && !initialLoad && (
                <HistoricalSykmeldingerEmptyState />
            )}
        </DashboardCard>
    )
}

function HistoricalSykmeldingerError(): ReactElement {
    return (
        <ComboTableFullCell>
            <Alert variant="error" className="max-w-prose">
                <Heading size="medium" level="3" spacing>
                    Ukjent feil ved henting av historiske sykmeldinger
                </Heading>
                <BodyShort spacing>
                    Det skjedde en ukjent feil under henting av sykmeldinger. Du kan prøve å laste siden på nytt, eller
                    prøve på nytt senere.
                </BodyShort>
            </Alert>
        </ComboTableFullCell>
    )
}

function HistoricalSykmeldingerEmptyState(): ReactElement {
    return (
        <div className="flex flex-col gap-6 items-center justify-center w-full h-64 text-text-subtle">
            <FlowerPetalsIcon aria-hidden fontSize="4rem" className="opacity-75" />
            <BodyShort>Pasienten har ingen historiske sykmeldinger</BodyShort>
        </div>
    )
}

export default HistoricalCard
