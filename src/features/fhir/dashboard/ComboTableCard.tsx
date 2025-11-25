import * as R from 'remeda'
import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'
import { BodyShort, Button, GlobalAlert, Skeleton, Table } from '@navikt/ds-react'
import { FlowerPetalsIcon } from '@navikt/aksel-icons'
import { NetworkStatus } from '@apollo/client'

import { AllDashboardDocument } from '@queries'
import useOnFocus from '@lib/hooks/useOnFocus'
import LegeOgBehandlerTelefonen from '@components/help/LegeOgBehandlerTelefonen'

import { ComboTable, ComboTableFullCell, ComboTableHeader } from './combo-table/ComboTable'
import DashboardCard from './card/DashboardCard'
import DashboardTable from './table/DashboardTable'

function ComboTableCard({ className }: { className?: string }): ReactElement {
    const dashboardQuery = useQuery(AllDashboardDocument)
    useOnFocus(dashboardQuery.refetch)

    const isRefetching = dashboardQuery.networkStatus === NetworkStatus.refetch
    const initialLoad = dashboardQuery.networkStatus === NetworkStatus.loading
    const hasDrafts = !!dashboardQuery.data?.drafts?.length
    const hasSykmeldinger = !!dashboardQuery.data?.sykmeldinger?.current.length
    const hasData = hasSykmeldinger || hasDrafts

    return (
        <DashboardCard className={className} ariaLabel="Pågående sykmeldinger og utkast" fetching={isRefetching}>
            {hasData && dashboardQuery.data && (
                <ComboTable
                    sykmeldinger={dashboardQuery.data.sykmeldinger?.current ?? []}
                    drafts={dashboardQuery.data.drafts ?? []}
                >
                    {dashboardQuery.error && !dashboardQuery.data.drafts == null && (
                        <AllDraftsError refetch={dashboardQuery.refetch} />
                    )}
                    {dashboardQuery.error && !dashboardQuery.data.sykmeldinger == null && (
                        <AllSykmeldingerError refetch={dashboardQuery.refetch} />
                    )}
                </ComboTable>
            )}
            {initialLoad && <ComboTableSkeleton />}
            {!initialLoad && !dashboardQuery.error && !hasData && <ComboTableEmptyState />}
            {!initialLoad && dashboardQuery.error && !hasData && <EverythingError refetch={dashboardQuery.refetch} />}
        </DashboardCard>
    )
}

function AllDraftsError({ refetch }: { refetch: () => void }): ReactElement {
    return (
        <Table.Row>
            <ComboTableFullCell className="p-0">
                <GlobalAlert status="error">
                    <GlobalAlert.Header>
                        <GlobalAlert.Title>Ukjent feil ved henting av utkast</GlobalAlert.Title>
                    </GlobalAlert.Header>
                    <GlobalAlert.Content>
                        <BodyShort spacing>
                            Det skjedde en ukjent feil under henting av dine utkast. Du kan prøve å laste siden på nytt,
                            eller prøve på nytt senere.
                        </BodyShort>
                        <Button type="button" size="small" variant="secondary-neutral" onClick={() => refetch()}>
                            Prøv på nytt
                        </Button>
                    </GlobalAlert.Content>
                </GlobalAlert>
            </ComboTableFullCell>
        </Table.Row>
    )
}

function AllSykmeldingerError({ refetch }: { refetch: () => void }): ReactElement {
    return (
        <Table.Row>
            <ComboTableFullCell className="p-0">
                <GlobalAlert status="error">
                    <GlobalAlert.Header>
                        <GlobalAlert.Title>Ukjent feil ved henting av sykmeldinger</GlobalAlert.Title>
                    </GlobalAlert.Header>
                    <GlobalAlert.Content>
                        <BodyShort spacing>
                            Det skjedde en ukjent feil under henting av sykmeldinger. Du kan prøve å laste siden på
                            nytt, eller prøve på nytt senere.
                        </BodyShort>
                        <Button type="button" size="small" variant="secondary-neutral" onClick={() => refetch()}>
                            Prøv på nytt
                        </Button>
                    </GlobalAlert.Content>
                </GlobalAlert>
            </ComboTableFullCell>
        </Table.Row>
    )
}

function EverythingError({ refetch }: { refetch: () => void }): ReactElement {
    return (
        <div className="flex justify-center items-center h-full">
            <GlobalAlert status="error">
                <GlobalAlert.Header>
                    <GlobalAlert.Title>Ukjent feil ved henting av sykmeldinger og utkast</GlobalAlert.Title>
                </GlobalAlert.Header>
                <GlobalAlert.Content>
                    <BodyShort>
                        Det skjedde en ukjent feil under henting av dine utkast. Du kan prøve å laste siden på nytt,
                        eller prøve på nytt senere.
                    </BodyShort>
                    <Button
                        type="button"
                        size="small"
                        className="my-4"
                        variant="secondary-neutral"
                        onClick={() => refetch()}
                    >
                        Prøv på nytt
                    </Button>
                    <LegeOgBehandlerTelefonen />
                </GlobalAlert.Content>
            </GlobalAlert>
        </div>
    )
}

function ComboTableEmptyState(): ReactElement {
    return (
        <div className="flex flex-col gap-6 items-center justify-center w-full h-64 text-text-subtle">
            <FlowerPetalsIcon aria-hidden fontSize="4rem" className="opacity-75" />
            <BodyShort>Pasienten har ingen utkast eller pågående sykmeldinger</BodyShort>
        </div>
    )
}

export function ComboTableSkeleton(): ReactElement {
    return (
        <DashboardTable>
            <ComboTableHeader />
            <Table.Body>
                {R.range(0, 4).map((index) => (
                    <Table.Row key={index}>
                        <Table.DataCell>
                            <Skeleton />
                        </Table.DataCell>
                        <Table.DataCell>
                            <Skeleton />
                        </Table.DataCell>
                        <Table.DataCell>
                            <Skeleton />
                        </Table.DataCell>
                        <Table.DataCell>
                            <Skeleton />
                        </Table.DataCell>
                        <Table.DataCell>
                            <Skeleton />
                        </Table.DataCell>
                        <Table.DataCell>
                            <Skeleton />
                        </Table.DataCell>
                        <Table.DataCell>
                            <Skeleton />
                        </Table.DataCell>
                    </Table.Row>
                ))}
            </Table.Body>
        </DashboardTable>
    )
}

export default ComboTableCard
