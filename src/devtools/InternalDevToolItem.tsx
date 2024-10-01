import React, { PropsWithChildren, ReactElement } from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'

type Props = { title: string; description: string }

export function DevToolItem({ title, description, children }: PropsWithChildren<Props>): ReactElement {
    return (
        <div className="p-2 border border-border-alt-3 rounded">
            <div className="-mt-6">
                <Heading level="3" size="xsmall" className="bg-surface-alt-3-subtle p-1 inline-block">
                    {title}
                </Heading>
            </div>
            <BodyShort size="small" className="mb-2">
                {description}
            </BodyShort>
            <div className="flex gap-3">{children}</div>
        </div>
    )
}
