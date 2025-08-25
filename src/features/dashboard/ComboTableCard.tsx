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

    return (
        <DashboardCard
            className={className}
            ariaLabel="Tidligere sykmeldinger og utkast"
            fetching={dashboardQuery.loading && dashboardQuery.dataState !== 'empty'}
        >
            {dashboardQuery.dataState === 'complete' && (
                <ComboTable
                    sykmeldinger={dashboardQuery.data.sykmeldinger ?? []}
                    drafts={dashboardQuery.data.drafts ?? []}
                >
                    {dashboardQuery.error && !dashboardQuery.data.drafts == null && <AllDraftsError />}
                    {dashboardQuery.error && !dashboardQuery.data.sykmeldinger == null && <AllSykmeldingerError />}
                </ComboTable>
            )}
            {dashboardQuery.loading && dashboardQuery.dataState !== 'complete' && <ComboTableSkeleton />}
            {dashboardQuery.dataState === 'complete' &&
                !dashboardQuery.data.sykmeldinger?.length &&
                !dashboardQuery.data.drafts!.length && <ComboTableEmptyState />}
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
