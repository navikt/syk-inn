import * as R from 'remeda'
import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'
import { Alert, BodyShort, Heading, Skeleton, Table } from '@navikt/ds-react'
import { FlowerPetalsIcon } from '@navikt/aksel-icons'
import { NetworkStatus } from '@apollo/client'

import { AllDashboardDocument } from '@queries'
import useOnFocus from '@lib/hooks/useOnFocus'

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
                    {dashboardQuery.error && !dashboardQuery.data.drafts == null && <AllDraftsError />}
                    {dashboardQuery.error && !dashboardQuery.data.sykmeldinger == null && <AllSykmeldingerError />}
                </ComboTable>
            )}
            {initialLoad && <ComboTableSkeleton />}
            {!initialLoad && !dashboardQuery.error && !hasData && <ComboTableEmptyState />}
            {!initialLoad && dashboardQuery.error && !hasData && <EverythingError />}
        </DashboardCard>
    )
}

function AllDraftsError(): ReactElement {
    return (
        <ComboTableFullCell>
            <Alert variant="error" className="max-w-prose">
                <Heading size="medium" level="3" spacing>
                    Ukjent feil ved henting av utkast
                </Heading>
                <BodyShort spacing>
                    Det skjedde en ukjent feil under henting av dine utkast. Du kan prøve å laste siden på nytt, eller
                    prøve på nytt senere.
                </BodyShort>
            </Alert>
        </ComboTableFullCell>
    )
}

function AllSykmeldingerError(): ReactElement {
    return (
        <ComboTableFullCell>
            <Alert variant="error" className="max-w-prose">
                <Heading size="medium" level="3" spacing>
                    Ukjent feil ved henting av sykmeldinger
                </Heading>
                <BodyShort spacing>
                    Det skjedde en ukjent feil under henting av sykmeldinger. Du kan prøve å laste siden på nytt, eller
                    prøve på nytt senere.
                </BodyShort>
            </Alert>
        </ComboTableFullCell>
    )
}

function EverythingError(): ReactElement {
    return (
        <DashboardTable>
            <ComboTableHeader className="text-text-subtle" />
            <Table.Body className="text-text-subtle">
                <Table.Row>
                    <ComboTableFullCell className="flex flex-col gap-6 items-center justify-center w-full h-64">
                        <Alert variant="error" className="max-w-prose">
                            <Heading size="medium" level="3" spacing>
                                Ukjent feil ved henting av sykmeldinger og utkast
                            </Heading>
                            <BodyShort spacing>
                                Det skjedde en ukjent feil under henting av dine utkast. Du kan prøve å laste siden på
                                nytt, eller prøve på nytt senere.
                            </BodyShort>
                        </Alert>
                    </ComboTableFullCell>
                </Table.Row>
            </Table.Body>
        </DashboardTable>
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
