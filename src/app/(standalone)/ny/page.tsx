import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'

import NySykmeldingWithContextPasient from '@features/ny-sykmelding-form/NySykmeldingWithContextPasient'

async function Page(): Promise<ReactElement> {
    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            <Heading level="2" size="medium" spacing>
                Opprett ny sykmelding
            </Heading>

            <NySykmeldingWithContextPasient />
        </PageBlock>
    )
}

export default Page
