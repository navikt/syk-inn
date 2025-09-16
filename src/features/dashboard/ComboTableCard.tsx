import * as R from 'remeda'
import React, { PropsWithChildren, ReactElement } from 'react'
import { useQuery } from '@apollo/client/react'
import { Alert, BodyShort, Heading, Skeleton, Table } from '@navikt/ds-react'
import { FlowerPetalsIcon } from '@navikt/aksel-icons'

import { AllDashboardDocument } from '@queries'
import useOnFocus from '@lib/hooks/useOnFocus'

import { ComboTable, ComboTableHeader } from './combo-table/ComboTable'
import DashboardCard from './card/DashboardCard'
import DashboardTable from './table/DashboardTable'

function ComboTableCard({ className }: { className?: string }): ReactElement {
    const dashboardQuery = useQuery(AllDashboardDocument)
    useOnFocus(dashboardQuery.refetch)

    const hasDrafts = !!dashboardQuery.data?.drafts?.length
    const hasSykmeldinger = !!dashboardQuery.data?.sykmeldinger?.length
    const hasData = hasSykmeldinger || hasDrafts

    return (
        <DashboardCard
            className={className}
            ariaLabel="Tidligere sykmeldinger og utkast"
            fetching={dashboardQuery.loading && dashboardQuery.dataState !== 'empty'}
        >
            {hasData && dashboardQuery.data && (
                <ComboTable
                    sykmeldinger={dashboardQuery.data.sykmeldinger ?? []}
                    drafts={dashboardQuery.data.drafts ?? []}
                >
                    {dashboardQuery.error && !dashboardQuery.data.drafts == null && <AllDraftsError />}
                    {dashboardQuery.error && !dashboardQuery.data.sykmeldinger == null && <AllSykmeldingerError />}
                </ComboTable>
            )}
            {dashboardQuery.loading && !hasData && <ComboTableSkeleton />}
            {!dashboardQuery.loading && !dashboardQuery.error && !hasData && <ComboTableEmptyState />}
            {!dashboardQuery.loading && dashboardQuery.error && !hasData && <EverythingError />}
        </DashboardCard>
    )
}

function ComboTableFullCell({ className, children }: PropsWithChildren<{ className?: string }>): ReactElement {
    return (
        <Table.DataCell colSpan={8}>
            <div className={className}>{children}</div>
        </Table.DataCell>
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
        <DashboardTable>
            <ComboTableHeader className="text-text-subtle" />
            <Table.Body className="text-text-subtle">
                <Table.Row>
                    <ComboTableFullCell className="flex flex-col gap-6 items-center justify-center w-full h-64">
                        <FlowerPetalsIcon aria-hidden fontSize="4rem" />
                        <BodyShort>Her var det ingen tidligere sykmeldinger eller utkast</BodyShort>
                    </ComboTableFullCell>
                </Table.Row>
            </Table.Body>
        </DashboardTable>
    )
}

export function ComboTableSkeleton(): ReactElement {
    return (
        <DashboardTable>
            <ComboTableHeader />
            <Table.Body>
                {R.range(0, 10).map((index) => (
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
