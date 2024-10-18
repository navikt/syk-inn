import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import Link from 'next/link'
import { PageBlock } from '@navikt/ds-react/Page'

import { isLocalOrDemo } from '@utils/env'
import { sessionAuthed } from '@fhir/sessions/session-lifecycle'
import FhirClientProvider from '@fhir/components/FhirClientProvider'

type Props = {
    searchParams: { code: string | undefined }
}

async function Page({ searchParams }: Props): Promise<ReactElement> {
    if (searchParams.code) {
        await sessionAuthed(searchParams.code)
    }

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
            <FhirClientProvider />
        </PageBlock>
    )
}

export default Page
