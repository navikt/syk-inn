import React, { PropsWithChildren, ReactElement } from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'

type Props = { title: string; description: string }

export function DevToolItem({ title, description, children }: PropsWithChildren<Props>): ReactElement {
    return (
        <div className="p-2">
            <Heading level="3" size="xsmall">
                {title}
            </Heading>
            <BodyShort size="small" className="mb-2">
                {description}
            </BodyShort>
            <div className="flex gap-3">{children}</div>
        </div>
    )
}
