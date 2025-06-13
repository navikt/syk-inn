import React, { PropsWithChildren, ReactElement, ReactNode } from 'react'
import { Heading } from '@navikt/ds-react'

import { cn } from '@utils/tw'
import { cleanId } from '@utils/string'

type StringTitle = { title: string; className?: string }
type NodeTitle = { id: string; title: ReactNode; className?: string }

function DashboardCard({ className, children, ...rest }: (StringTitle | NodeTitle) & PropsWithChildren): ReactElement {
    const id = 'id' in rest ? cleanId(rest.id) : cleanId(rest.title)

    return (
        <section className={cn(className, 'bg-bg-default rounded-sm p-4')} aria-labelledby={id}>
            <Heading size="medium" level="2" spacing id={id}>
                {rest.title}
            </Heading>
            {children}
        </section>
    )
}

export default DashboardCard
