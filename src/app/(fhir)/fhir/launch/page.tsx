import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'
import Link from 'next/link'
import { logger } from '@navikt/next-logger'

import { bundledEnv, isLocalOrDemo } from '@utils/env'
import { saveSessionIssuer } from '@fhir/sessions/session-lifecycle'
import FhirLaunchInitialization from '@fhir/components/FhirLaunchInitialization'
import { wait } from '@utils/wait'

type Props = {
    searchParams: Promise<{ iss: string | undefined }>
}

async function Page({ searchParams }: Props): Promise<ReactElement> {
    // TODO: Give us self enough time to open devtools when debugging webmed
    if (bundledEnv.NEXT_PUBLIC_RUNTIME_ENV === 'dev-gcp') {
        logger.warn('DEBUG: Launching app! Waiting 10 seconds...')
        await wait(10000)
    }

    const params = await searchParams

    if (params.iss) {
        /**
         * Server component:
         *
         * Launch is server side rendered with ?iss=<issuer> when the EPJ launches the application. We store the issuer
         * together with the current users session-ID to be able to verify the token at a later time.
         */
        await saveSessionIssuer(params.iss)
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
            <FhirLaunchInitialization />
        </PageBlock>
    )
}

export default Page
