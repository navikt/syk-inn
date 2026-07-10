import { Table, Tag, TagProps } from '@navikt/ds-react'
import React, { PropsWithChildren, ReactElement, ReactNode } from 'react'

export function ComboTableFullCell({ className, children }: PropsWithChildren<{ className?: string }>): ReactElement {
    return (
        <Table.DataCell colSpan={8} className={className}>
            {children}
        </Table.DataCell>
    )
}

export function TableRow(props: {
    perioder: string | ReactNode
    diagnose: string | ReactNode | null
    grad: string | ReactNode | null
    arbeidsgiver: string | ReactNode | null
    status: 'draft' | 'previous' | 'current'
    actions: ReactElement | null
}): ReactElement {
    return (
        <Table.Row>
            <Table.DataCell>{props.perioder}</Table.DataCell>
            <Table.DataCell>{props.diagnose}</Table.DataCell>
            <Table.DataCell>{props.grad}</Table.DataCell>
            <Table.DataCell>{props.arbeidsgiver}</Table.DataCell>
            <Table.DataCell>
                <StatusTag status={props.status} />
            </Table.DataCell>
            <Table.DataCell>{props.actions}</Table.DataCell>
        </Table.Row>
    )
}

function StatusTag({ status }: { status: 'draft' | 'previous' | 'current' }): ReactElement {
    let text: string, variant: TagProps['variant']
    switch (status) {
        case 'draft':
            text = 'Utkast'
            variant = 'info'
            break
        case 'previous':
            text = 'Tidligere'
            variant = 'neutral'
            break
        case 'current':
            text = 'Pågående'
            variant = 'success'
            break
    }

    return <Tag variant={variant}>{text}</Tag>
}
