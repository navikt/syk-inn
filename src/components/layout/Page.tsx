import React, { PropsWithChildren, ReactElement, ReactNode } from 'react'
import { Page, PageBlock } from '@navikt/ds-react/Page'
import { Heading } from '@navikt/ds-react'

type Props = {
    heading: ReactNode
}

export function PageLayout({ heading, children }: PropsWithChildren<Props>): ReactElement {
    return (
        <Page className="bg-transparent">
            <PageBlock as="main" gutters className="pt-4">
                <Heading level="2" size="medium" spacing>
                    {heading}
                </Heading>

                {children}
            </PageBlock>
        </Page>
    )
}
