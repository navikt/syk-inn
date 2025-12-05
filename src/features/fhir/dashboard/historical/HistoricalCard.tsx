import React, { ReactElement } from 'react'
import { BodyShort, Button, GlobalAlert, Heading } from '@navikt/ds-react'
import { useQuery } from '@apollo/client/react'
import { NetworkStatus } from '@apollo/client'
import { FlowerPetalsIcon } from '@navikt/aksel-icons'

import DashboardCard from '@features/fhir/dashboard/card/DashboardCard'
import { AllDashboardDocument, KonsultasjonDocument } from '@queries'
import { ComboTable } from '@features/fhir/dashboard/combo-table/ComboTable'
import { RequestSykmeldinger } from '@features/fhir/dashboard/historical/RequestSykmeldinger'
import { cn } from '@lib/tw'
import SessionIdInfo from '@components/help/SessionIdInfo'

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
            className={cn('overflow-auto', className)}
            fetching={isRefetching}
            ariaBusy={isRefetching || initialLoad}
        >
            {hasSykmeldinger && hasRequested && (
                <ComboTable sykmeldinger={dashboardQuery.data?.sykmeldinger?.historical ?? []} drafts={[]} />
            )}
            {dashboardQuery.error && <HistoricalSykmeldingerError refetch={dashboardQuery.refetch} />}
            {!dashboardQuery.error && !hasRequested && <RequestSykmeldinger loading={initialLoad} />}
            {!dashboardQuery.error && hasRequested && !hasSykmeldinger && !initialLoad && (
                <HistoricalSykmeldingerEmptyState />
            )}
        </DashboardCard>
    )
}

function HistoricalSykmeldingerError({ refetch }: { refetch: () => void }): ReactElement {
    return (
        <div className="flex justify-center items-center h-full pb-8">
            <GlobalAlert status="error">
                <GlobalAlert.Header>
                    <GlobalAlert.Title>Ukjent feil ved henting av historiske sykmeldinger</GlobalAlert.Title>
                </GlobalAlert.Header>
                <GlobalAlert.Content>
                    <BodyShort spacing>
                        Det skjedde en ukjent feil under henting av sykmeldinger. Du kan prøve å laste siden på nytt,
                        eller prøve på nytt senere.
                    </BodyShort>
                    <Button type="button" size="small" variant="secondary-neutral" onClick={() => refetch()}>
                        Prøv på nytt
                    </Button>
                    <SessionIdInfo />
                </GlobalAlert.Content>
            </GlobalAlert>
        </div>
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
