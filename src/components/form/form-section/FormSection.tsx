import React, { PropsWithChildren, ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'

import { cleanId } from '@utils/string'
import { cn } from '@utils/tw'

type Props = {
    title: string
    className?: string
    hideTitle?: boolean
}

function FormSection({ title, children, hideTitle, className }: PropsWithChildren<Props>): ReactElement {
    const cardTitleId = `expandable-form-section-${cleanId(title)}`

    return (
        <section aria-labelledby={cardTitleId} className={className}>
            <Heading size="medium" level="2" id={cardTitleId} className={cn({ 'sr-only': hideTitle })}>
                {title}
            </Heading>
            {children}
        </section>
    )
}

export default FormSection
