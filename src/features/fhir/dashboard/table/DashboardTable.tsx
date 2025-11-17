import { Table } from '@navikt/ds-react'
import React, { CSSProperties, PropsWithChildren, ReactElement } from 'react'

function DashboardTable({ children }: PropsWithChildren): ReactElement {
    return (
        <Table
            style={
                {
                    '--ac-table-row-border': 'var(--a-border-subtle)',
                } as CSSProperties
            }
        >
            {children}
        </Table>
    )
}

export default DashboardTable
