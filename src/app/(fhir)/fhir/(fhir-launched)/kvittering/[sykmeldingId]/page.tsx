import React, { ReactElement } from 'react'
import Link from 'next/link'
import { Heading } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'

import { isLocalOrDemo } from '@utils/env'
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
            {isLocalOrDemo && (
                <div className="mb-2">
                    <Link href="/">← Back to development page</Link>
                </div>
            )}
            <Heading level="2" size="medium" spacing>
                Kvittering på innsendt sykmelding
            </Heading>
            <ExistingSykmeldingKvittering sykmeldingId={sykmeldingId} />
        </PageBlock>
    )
}

export default Page
