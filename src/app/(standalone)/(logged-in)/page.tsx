import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'

import { PageLayout } from '@components/layout/Page'
import { AkselNextLink } from '@components/links/AkselNextLink'

function Page(): ReactElement {
    return (
        <PageLayout
            heading={
                <Heading level="2" size="medium">
                    TODO
                </Heading>
            }
            bg="white"
            size="fit"
        >
            <div>TODO: Pasient-picker</div>
            <div>
                Gå til (broken) skjema: <AkselNextLink href="/ny">do it</AkselNextLink>
            </div>
        </PageLayout>
    )
}

export default Page
