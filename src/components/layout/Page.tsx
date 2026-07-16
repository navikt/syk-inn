import { Heading } from '@navikt/ds-react'
import { Page, PageBlock } from '@navikt/ds-react/Page'
import React, { PropsWithChildren, ReactElement, ReactNode } from 'react'

import { cn } from '#lib/tw'

import { LoadableHeader, LoadableHeaderProps } from '../animation/LoadableHeader'

type Props =
    | {
          heading: ReactNode
          bg: 'transparent' | 'white'
          size: 'full' | 'fit'
      }
    | {
          noHeading: true
          bg: 'transparent' | 'white'
          size: 'full' | 'fit'
      }

export function PageLayout({ size, bg, children, ...props }: PropsWithChildren<Props>): ReactElement {
    return (
        <Page className="bg-transparent">
            <PageBlock as="main" gutters className="pt-4">
                {!('noHeading' in props) &&
                    (typeof props.heading === 'string' ? (
                        <StaticPageHeading>{props.heading}</StaticPageHeading>
                    ) : (
                        props.heading
                    ))}
                <div className={cn('rounded-xl', { 'lg:w-fit': size !== 'full', 'bg-ax-bg-default': bg === 'white' })}>
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
        <Heading level="2" size="medium" className="mb-2">
            {children}
        </Heading>
    )
}
