import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'

import NySykmeldingForm from '@components/ny-sykmelding-form/NySykmeldingForm'

async function Page(): Promise<ReactElement> {
    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            <Heading level="2" size="medium" spacing>
                Opprett ny sykmelding
            </Heading>

            <NySykmeldingForm />
        </PageBlock>
    )
}

export default Page
