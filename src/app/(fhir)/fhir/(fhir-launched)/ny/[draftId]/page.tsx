import React, { ReactElement } from 'react'
import { Page, PageBlock } from '@navikt/ds-react/Page'

import NySykmeldingWithContextPasient from '@features/ny-sykmelding-form/NySykmeldingWithContextPasient'

async function NySykmeldingPage(): Promise<ReactElement> {
    return (
        <Page className="bg-transparent">
            <PageBlock as="main" gutters className="pt-4">
                <NySykmeldingWithContextPasient />
            </PageBlock>
        </Page>
    )
}

export default NySykmeldingPage
