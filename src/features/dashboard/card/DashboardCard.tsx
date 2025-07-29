import React, { PropsWithChildren, ReactElement, ReactNode } from 'react'
import { Heading } from '@navikt/ds-react'

import { cn } from '@lib/tw'
import { cleanId } from '@lib/string'

type BaseProps = { className?: string }
type StringTitle = { title: string }
type NodeTitle = { title: ReactNode; id: string }
type NoTitle = { ariaLabel: string }

function DashboardCard({
    className,
    children,
    ...rest
}: (StringTitle | NodeTitle | NoTitle) & PropsWithChildren<BaseProps>): ReactElement {
    const id = 'id' in rest ? cleanId(rest.id) : 'title' in rest ? cleanId(rest.title) : undefined

    return (
        <section
            className={cn(className, 'bg-bg-default rounded-sm p-4')}
            aria-labelledby={id}
            aria-label={'ariaLabel' in rest ? rest.ariaLabel : undefined}
        >
            {'title' in rest && (
                <Heading size="medium" level="2" spacing id={id}>
                    {rest.title}
                </Heading>
            )}
            {children}
        </section>
    )
}

export default DashboardCard
