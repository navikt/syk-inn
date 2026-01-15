import React, { PropsWithChildren, ReactElement } from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'

import { cn } from '@lib/tw'

type Props = {
    className?: string
    title: string
    description: string
}

export function DevToolItem({ title, description, children, className }: PropsWithChildren<Props>): ReactElement {
    return (
        <div className="p-2 border border-ax-border-brand-blue rounded-sm grow">
            <div className="-mt-6">
                <Heading level="3" size="xsmall" className="bg-ax-bg-brand-blue-soft p-1 inline-block">
                    {title}
                </Heading>
            </div>
            <BodyShort size="small" className="mb-2">
                {description}
            </BodyShort>
            <div className={cn(className)}>{children}</div>
        </div>
    )
}
