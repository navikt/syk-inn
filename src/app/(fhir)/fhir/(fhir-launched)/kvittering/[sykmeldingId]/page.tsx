import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import { Page, PageBlock } from '@navikt/ds-react/Page'

import SykmeldingKvittering from '@features/sykmelding-kvittering/SykmeldingKvittering'

type Props = {
    params: Promise<{
        sykmeldingId: string
    }>
}

async function KvitteringPage({ params }: Props): Promise<ReactElement> {
    const { sykmeldingId } = await params

    return (
        <Page className="bg-transparent">
            <PageBlock as="main" gutters className="pt-4">
                <Heading level="2" size="medium" spacing>
                    Kvittering på innsendt sykmelding
                </Heading>
                <SykmeldingKvittering sykmeldingId={sykmeldingId} />
            </PageBlock>
        </Page>
    )
}

export default KvitteringPage
