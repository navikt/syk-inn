import React, { ReactElement } from 'react'
import { Page, PageBlock } from '@navikt/ds-react/Page'

import NySykmeldingForm from '@components/ny-sykmelding-form/NySykmeldingForm'

async function NySykmeldingPage(): Promise<ReactElement> {
    return (
        <Page className="bg-bg-subtle">
            <PageBlock as="main" gutters className="pt-4">
                <NySykmeldingForm />
            </PageBlock>
        </Page>
    )
}

export default NySykmeldingPage
