import React, { PropsWithChildren, ReactElement, ReactNode } from 'react'
import { Page, PageBlock } from '@navikt/ds-react/Page'
import { Heading } from '@navikt/ds-react'

import LoadableHeader, { LoadableHeaderProps } from '@components/animation/LoadableHeader'

type Props = {
    heading: ReactNode
}

export function PageLayout({ heading, children }: PropsWithChildren<Props>): ReactElement {
    return (
        <Page className="bg-transparent">
            <PageBlock as="main" gutters className="pt-4">
                {typeof heading === 'string' ? <StaticPageHeading>{heading}</StaticPageHeading> : heading}
                {children}
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
