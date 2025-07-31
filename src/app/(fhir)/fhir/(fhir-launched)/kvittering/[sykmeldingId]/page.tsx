import React, { ReactElement } from 'react'

import { PageLayout } from '@components/layout/Page'
import SykmeldingKvittering from '@features/sykmelding-kvittering/SykmeldingKvittering'

type Props = {
    params: Promise<{
        sykmeldingId: string
    }>
}

async function KvitteringPage({ params }: Props): Promise<ReactElement> {
    const { sykmeldingId } = await params

    return (
        <PageLayout heading="Kvittering på innsendt sykmelding" bg="white" size="fit">
            <SykmeldingKvittering sykmeldingId={sykmeldingId} />
        </PageLayout>
    )
}

export default KvitteringPage
