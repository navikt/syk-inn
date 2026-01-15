import { Table } from '@navikt/ds-react'
import React, { PropsWithChildren, ReactElement } from 'react'

function DashboardTable({ children, className }: PropsWithChildren<{ className?: string }>): ReactElement {
    return (
        <Table
            /* TODO: Replace this with aksel v8 themeing
            style={
                {
                    '--ac-table-row-border': 'var(--ax-border-neutral-subtle)',
                } as CSSProperties
            }
             */
            className={className}
        >
            {children}
        </Table>
    )
}

export default DashboardTable
