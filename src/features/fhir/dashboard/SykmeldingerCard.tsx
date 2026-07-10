import { NetworkStatus } from '@apollo/client'
import { useQuery } from '@apollo/client/react'
import { FlowerPetalsIcon } from '@navikt/aksel-icons'
import { BodyShort, Button, GlobalAlert, Skeleton, Table } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import * as R from 'remeda'

import { LegeOgBehandlerTelefonen } from '#components/help/LegeOgBehandlerTelefonen'
import { SessionIdInfo } from '#components/help/SessionIdInfo'
import useOnFocus from '#lib/hooks/useOnFocus'
import { cn } from '#lib/tw'
import { AllDashboardDocument, AllDashboardQuery, SykmeldingFragment } from '#queries'

import { DashboardCard } from './card/DashboardCard'
import { ComboTable, ComboTableHeader } from './combo-table/ComboTable'
import { ComboTableFullCell } from './combo-table/ComboTableRows'
import { HistoriskeSykmeldingerEmptyState, RequestHistoriske } from './combo-table/HistoriskeSykmeldinger'
import { DashboardTable } from './table/DashboardTable'

export function SykmeldingerCard({ className }: { className?: string }): ReactElement {
    const dashboardQuery = useQuery(AllDashboardDocument)
    useOnFocus(dashboardQuery.refetch)

    const isRefetching = dashboardQuery.networkStatus === NetworkStatus.refetch
    const initialLoad = dashboardQuery.networkStatus === NetworkStatus.loading
    const allSykmeldinger = getAllSykmeldingerFromQuery(dashboardQuery.data?.sykmeldinger)
    const hasData = !!allSykmeldinger.length || !!dashboardQuery.data?.drafts?.length

    return (
        <DashboardCard
            className={cn('overflow-auto', className)}
            ariaLabel="Pågående sykmeldinger og utkast"
            ariaBusy={initialLoad || isRefetching}
            fetching={isRefetching}
        >
            {/* Loading skeleton, empty state and when everything fails, only one of these will be rendered */}
            {initialLoad && <ComboTableSkeleton />}
            {!initialLoad && !dashboardQuery.error && !hasData && <ComboTableEmptyState />}
            {!initialLoad && dashboardQuery.error && !hasData && <EverythingError refetch={dashboardQuery.refetch} />}

            {/* Partial errors are handled within the table, i.e. drafts load but not sykmeldinger */}
            {hasData && dashboardQuery.data && (
                <ComboTable sykmeldinger={allSykmeldinger} drafts={dashboardQuery.data.drafts}>
                    {dashboardQuery.error && dashboardQuery.data.drafts == null && (
                        <AllDraftsError refetch={dashboardQuery.refetch} />
                    )}
                    {dashboardQuery.error && dashboardQuery.data.sykmeldinger == null && (
                        <AllSykmeldingerError refetch={dashboardQuery.refetch} />
                    )}
                </ComboTable>
            )}

            {/* "Historiske" sykmeldinger (behind toggle) are rendered in combo table, but request and empty state are handled here */}
            {!dashboardQuery.loading && dashboardQuery.data?.sykmeldinger?.__typename === 'Unrequested' && (
                <RequestHistoriske loading={isRefetching} />
            )}
            {!dashboardQuery.loading &&
                dashboardQuery.data?.sykmeldinger?.__typename === 'Requested' &&
                dashboardQuery.data?.sykmeldinger?.historiske.length === 0 && <HistoriskeSykmeldingerEmptyState />}
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
                        <Button
                            data-color="neutral"
                            type="button"
                            size="small"
                            variant="secondary"
                            onClick={() => refetch()}
                        >
                            Prøv på nytt
                        </Button>
                        <SessionIdInfo />
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
                        <Button
                            data-color="neutral"
                            type="button"
                            size="small"
                            variant="secondary"
                            onClick={() => refetch()}
                        >
                            Prøv på nytt
                        </Button>
                        <SessionIdInfo />
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
                        data-color="neutral"
                        type="button"
                        size="small"
                        className="my-4"
                        variant="secondary"
                        onClick={() => refetch()}
                    >
                        Prøv på nytt
                    </Button>
                    <LegeOgBehandlerTelefonen />
                    <SessionIdInfo />
                </GlobalAlert.Content>
            </GlobalAlert>
        </div>
    )
}

function ComboTableEmptyState(): ReactElement {
    return (
        <div className="flex flex-col gap-6 items-center justify-center w-full h-64 text-ax-text-neutral-subtle">
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

function getAllSykmeldingerFromQuery(
    sykmeldinger: AllDashboardQuery['sykmeldinger'] | undefined,
): SykmeldingFragment[] {
    if (!sykmeldinger) return []

    if (sykmeldinger.__typename === 'Requested') {
        return [...sykmeldinger.aktuelle, ...(sykmeldinger.historiske ?? [])]
    }

    return sykmeldinger.aktuelle
}
