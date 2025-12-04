import React, { ReactElement } from 'react'

import { PageLayout } from '@components/layout/Page'
import SykmeldingKvittering from '@features/sykmelding-kvittering/SykmeldingKvittering'

async function KvitteringPage({
    params,
}: PageProps<'/fhir/[patientId]/kvittering/[sykmeldingId]'>): Promise<ReactElement> {
    const { sykmeldingId } = await params

    return (
        <PageLayout heading="Kvittering på innsendt sykmelding" bg="white" size="fit">
            <SykmeldingKvittering sykmeldingId={sykmeldingId} />
        </PageLayout>
    )
}

export default KvitteringPage
