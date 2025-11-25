import { Table } from '@navikt/ds-react'
import React, { CSSProperties, PropsWithChildren, ReactElement } from 'react'

function DashboardTable({ children, className }: PropsWithChildren<{ className?: string }>): ReactElement {
    return (
        <Table
            style={
                {
                    '--ac-table-row-border': 'var(--a-border-subtle)',
                } as CSSProperties
            }
            className={className}
        >
            {children}
        </Table>
    )
}

export default DashboardTable
