import React, { ReactElement } from 'react'

type Props = {
    label: string
    value?: string | string[]
    italic?: boolean
    full?: boolean
    /** Optional, used for more complex stuff */
    children?: React.ReactNode
}

export function ValueItem({ label, value, full, italic, children }: Props): ReactElement {
    return (
        <div className={'value-item' + (full ? ' full' : '') + (italic ? ' italic' : '')}>
            <dd>{label}</dd>
            {Array.isArray(value) ? value.map((line, index) => <dt key={index}>{line}</dt>) : <dt>{value}</dt>}
            {children}
        </div>
    )
}

export function ValueSection({
    id,
    title,
    children,
}: {
    id: string
    title: string
    children: React.ReactNode
}): ReactElement {
    return (
        <section className="value-section" aria-labelledby={id}>
            <h2 id={id}>{title}</h2>
            <div className="value-items">{children}</div>
        </section>
    )
}
