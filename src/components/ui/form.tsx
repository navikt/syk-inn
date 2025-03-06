import { PropsWithChildren, ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'

import { cleanId } from '@utils/string'

type Props = {
    title: string
    icon?: ReactElement
    description?: string
}

export function FormSection({ children, icon, title }: PropsWithChildren<Props>): ReactElement {
    const headingId = `section-heading-${cleanId(title)}`

    return (
        <div className="relative">
            <section className="p-4 bg-bg-subtle rounded-sm" aria-labelledby={headingId}>
                <Heading level="2" size="medium" id={headingId} className="flex items-center gap-1">
                    {icon}
                    {title}
                </Heading>
                {children}
            </section>
        </div>
    )
}
