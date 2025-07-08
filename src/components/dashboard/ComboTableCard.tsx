import * as R from 'remeda'
import React, { ReactElement } from 'react'
import { useQuery } from '@apollo/client'
import { Skeleton, Table } from '@navikt/ds-react'

import DashboardCard from '@components/dashboard/card/DashboardCard'
import { AllSykmeldingerDocument, GetAllDraftsDocument } from '@queries'
import { ComboTable, ComboTableHeader } from '@components/dashboard/combo-table/ComboTable'
import DashboardTable from '@components/dashboard/table/DashboardTable'

import useOnFocus from '../../hooks/useOnFocus'

function ComboTableCard({ className }: { className?: string }): ReactElement {
    const allDrafts = useQuery(GetAllDraftsDocument)
    const sykmeldinger = useQuery(AllSykmeldingerDocument)

    useOnFocus(allDrafts.refetch)
    useOnFocus(sykmeldinger.refetch)

    return (
        <DashboardCard className={className} ariaLabel="Tidligere sykmeldinger og utkast">
            {allDrafts.loading || sykmeldinger.loading ? (
                <ComboTableSkeleton />
            ) : (
                <ComboTable
                    sykmeldinger={sykmeldinger.data?.sykmeldinger ?? []}
                    drafts={allDrafts.data?.drafts ?? []}
                />
            )}
        </DashboardCard>
    )
}

function ComboTableSkeleton(): ReactElement {
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
