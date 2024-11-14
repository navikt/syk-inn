import React, { ReactElement } from 'react'
import Link from 'next/link'
import { Heading } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'

import NySykmeldingForm from '@components/ny-sykmelding-form/NySykmeldingForm'
import { isLocalOrDemo } from '@utils/env'

async function Page(): Promise<ReactElement> {
    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            {isLocalOrDemo && (
                <div className="mb-2">
                    <Link href="/">← Back to development page</Link>
                </div>
            )}

            <Heading level="2" size="medium" spacing>
                Opprett ny sykmelding
            </Heading>

            <NySykmeldingForm />
        </PageBlock>
    )
}

export default Page
