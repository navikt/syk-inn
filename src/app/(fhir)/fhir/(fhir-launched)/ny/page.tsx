import React, { ReactElement } from 'react'
import { PageBlock } from '@navikt/ds-react/Page'
import Link from 'next/link'

import { isLocalOrDemo } from '@utils/env'
import NySykmeldingForm from '@components/ny-sykmelding-form/NySykmeldingForm'

async function Page(): Promise<ReactElement> {
    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            {isLocalOrDemo && (
                <div className="mb-2">
                    <Link href="/">← Back to development page</Link>
                </div>
            )}
            <NySykmeldingForm />
        </PageBlock>
    )
}

export default Page
