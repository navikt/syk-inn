import React, { PropsWithChildren, ReactElement, ReactNode } from 'react'
import { Page, PageBlock } from '@navikt/ds-react/Page'
import { Heading } from '@navikt/ds-react'

import LoadableHeader, { LoadableHeaderProps } from '@components/animation/LoadableHeader'
import { cn } from '@lib/tw'

type Props = {
    heading: ReactNode
    bg: 'transparent' | 'white'
    size: 'full' | 'fit'
}

export function PageLayout({ heading, size, bg, children }: PropsWithChildren<Props>): ReactElement {
    return (
        <Page className="bg-transparent">
            <PageBlock as="main" gutters className="pt-4">
                {typeof heading === 'string' ? <StaticPageHeading>{heading}</StaticPageHeading> : heading}
                <div className={cn('rounded-xl', { 'w-fit': size !== 'full', 'bg-white': bg === 'white' })}>
                    {children}
                </div>
            </PageBlock>
        </Page>
    )
}

export function LoadablePageHeader(props: Omit<LoadableHeaderProps, 'level' | 'size'>): ReactElement {
    return <LoadableHeader {...props} level="2" size="medium" />
}

export function StaticPageHeading({ children }: PropsWithChildren): ReactElement {
    return (
        <Heading level="2" size="medium" spacing>
            {children}
        </Heading>
    )
}
