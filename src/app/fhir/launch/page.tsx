import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'
import Link from 'next/link'

import { isLocalOrDemo } from '@utils/env'
import { sessionLaunched } from '@fhir/session-lifecycle'

import FhirInitialization from './fhir-initialization'

type Props = {
    searchParams: { iss: string | undefined }
}

async function Page({ searchParams }: Props): Promise<ReactElement> {
    if (searchParams.iss) {
        await sessionLaunched(searchParams.iss)
    }

    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            {isLocalOrDemo && (
                <div className="mb-2">
                    <Link href="/">← Back to development page</Link>
                </div>
            )}
            <Heading level="2" size="medium" spacing>
                Starter applikasjon for sykmeldinger
            </Heading>
            <FhirInitialization />
        </PageBlock>
    )
}

export default Page
