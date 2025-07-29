import React, { PropsWithChildren, ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'

import { cleanId } from '@lib/string'

type SectionProps = {
    title: string
    icon?: ReactElement
    description?: string
}

export function Section({ children, icon, title }: PropsWithChildren<SectionProps>): ReactElement {
    const headingId = `section-heading-${cleanId(title)}`

    return (
        <div className="relative">
            <section className="mb-4" aria-labelledby={headingId}>
                <Heading level="2" size="medium" id={headingId} className="flex items-center gap-1" spacing>
                    {icon}
                    {title}
                </Heading>
                {children}
            </section>
        </div>
    )
}
