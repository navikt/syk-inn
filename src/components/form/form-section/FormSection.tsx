import React, { PropsWithChildren, ReactElement, ReactNode } from 'react'
import { Heading } from '@navikt/ds-react'

import { cleanId } from '@lib/string'
import { cn } from '@lib/tw'

type Props = {
    title: string
    className?: string
    hideTitle?: boolean
    hideBorder?: boolean
    helpText?: ReactNode
}

function FormSection({
    title,
    children,
    hideTitle,
    hideBorder = false,
    helpText,
    className,
}: PropsWithChildren<Props>): ReactElement {
    const cardTitleId = `expandable-form-section-${cleanId(title)}`

    return (
        <section
            aria-labelledby={cardTitleId}
            className={cn(className, 'pb-4', { 'border-b border-b-border-subtle': !hideBorder })}
        >
            <div className="flex flex-row gap-1 mb-2">
                <Heading size="medium" level="2" id={cardTitleId} className={cn({ 'sr-only': hideTitle })}>
                    {title}
                </Heading>
                {helpText}
            </div>
            {children}
        </section>
    )
}

export default FormSection
