import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'

import ExistingSykmeldingKvittering from '@components/existing-sykmelding-kvittering/ExistingSykmeldingKvittering'

type Props = {
    params: Promise<{
        sykmeldingId: string
    }>
}

async function Page({ params }: Props): Promise<ReactElement> {
    const { sykmeldingId } = await params

    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            <Heading level="2" size="medium" spacing>
                Kvittering på innsendt sykmelding
            </Heading>
            <ExistingSykmeldingKvittering sykmeldingId={sykmeldingId} />
        </PageBlock>
    )
}

export default Page
