import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import { Page, PageBlock } from '@navikt/ds-react/Page'

import ExistingSykmeldingKvittering from '@components/existing-sykmelding-kvittering/ExistingSykmeldingKvittering'
import PdfDebugView from '@components/pdf-debug-view/PdfDebugView'

type Props = {
    params: Promise<{
        sykmeldingId: string
    }>
}

async function KvitteringPage({ params }: Props): Promise<ReactElement> {
    const { sykmeldingId } = await params

    return (
        <Page className="bg-transparent">
            <PageBlock as="main" width="xl" gutters className="pt-4">
                <Heading level="2" size="medium" spacing>
                    Kvittering på innsendt sykmelding
                </Heading>
                <div className="flex gap-8">
                    <ExistingSykmeldingKvittering sykmeldingId={sykmeldingId} />
                    <PdfDebugView sykmeldingId={sykmeldingId} />
                </div>
            </PageBlock>
        </Page>
    )
}

export default KvitteringPage
