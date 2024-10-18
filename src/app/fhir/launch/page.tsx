import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'
import Link from 'next/link'

import { isLocalOrDemo } from '@utils/env'
import { sessionLaunched } from '@fhir/sessions/session-lifecycle'
import FhirLaurchInitialization from '@fhir/components/FhirLaurchInitialization'

type Props = {
    searchParams: { iss: string | undefined }
}

async function Page({ searchParams }: Props): Promise<ReactElement> {
    if (searchParams.iss) {
        /**
         * Server component:
         *
         * Launch is server side rendered with ?iss=<issuer> when the EPJ launches the application. We store the issuer
         * together with the current users session-ID to be able to verify the token at a later time.
         */
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
            <FhirLaurchInitialization />
        </PageBlock>
    )
}

export default Page
