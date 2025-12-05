import React, { PropsWithChildren, ReactElement } from 'react'
import { BodyLong, Heading, Label, Skeleton } from '@navikt/ds-react'

import { cleanId } from '@lib/string'

type ValueSectionProps = {
    title: string
}

/**
 * Simulates the look and feel of aksel's FormSummary component
 */
export function ValuesSection({ title, children }: PropsWithChildren<ValueSectionProps>): ReactElement {
    const id = cleanId(title)

    return (
        <section
            aria-labelledby={id}
            className="bg-surface-default border border-border-subtle rounded-large overflow-hidden"
        >
            <header className="bg-surface-subtle py-4 px-6">
                <Heading id={id} size="medium" level="3">
                    {title}
                </Heading>
            </header>
            <div className="p-6 pt-5">{children}</div>
        </section>
    )
}

type SykmeldingValueProps = {
    title: string
}

/**
 * This simulates the functionality of FormSummary's Answer with label and value behaviour
 */
export function ValueItem({ title, children }: PropsWithChildren<SykmeldingValueProps>): ReactElement {
    return (
        <div className="not-last:border-b border-b-border-subtle not-last:mb-4 not-last:pb-4">
            <Label as="dt">{title}</Label>
            <BodyLong as="dd">{children}</BodyLong>
        </div>
    )
}

export function ValueItemSkeleton(): ReactElement {
    return (
        <div className="not-last:border-b border-b-border-subtle not-last:mb-4 not-last:pb-4">
            <Label as="dt">
                <Skeleton variant="text" width={98} />
            </Label>
            <BodyLong as="dd">
                <Skeleton variant="text" width="100%" />
            </BodyLong>
        </div>
    )
}
