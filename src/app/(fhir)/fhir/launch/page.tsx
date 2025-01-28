import React, { ReactElement } from 'react'
import { Alert, BodyShort, Heading } from '@navikt/ds-react'
import { PageBlock } from '@navikt/ds-react/Page'
import Link from 'next/link'
import { logger } from '@navikt/next-logger'

import { isLocalOrDemo } from '@utils/env'
import { saveSessionIssuer } from '@fhir/sessions/session-lifecycle'
import FhirLaunchInitialization from '@fhir/components/FhirLaunchInitialization'
import { isKnownFhirServer, removeTrailingSlash } from '@fhir/issuers'

type Props = {
    searchParams: Promise<{ iss: string | undefined }>
}

async function Page({ searchParams }: Props): Promise<ReactElement> {
    const params = await searchParams

    if (params.iss && !isKnownFhirServer(params.iss)) {
        logger.warn(`Attempted to launch with unknown issuer: ${params.iss}`)

        /**
         * Server component:
         *
         * Only known issuers are allowed to launch the application. If the issuer is known, we can proceed with the
         * launch, otherwise we'll show a generic configuration error message.
         */
        return (
            <PageBlock as="main" width="xl" gutters className="pt-4">
                {isLocalOrDemo && (
                    <div className="mb-2">
                        <Link href="/">← Back to development page</Link>
                    </div>
                )}
                <div className="max-w-prose">
                    <Heading level="2" size="medium" spacing>
                        Ugyldig konfigurasjon
                    </Heading>
                    <Alert variant="error">
                        <BodyShort spacing>Kunne ikke starte applikasjonen. Ukjent EPJ-system.</BodyShort>
                        <BodyShort>
                            Dersom problemet vedvarer, ta kontakt med NAV brukerstøtte, eller hos brukerstøtte hos din
                            EPJ-leverandør.
                        </BodyShort>
                    </Alert>
                </div>
            </PageBlock>
        )
    }

    if (params.iss) {
        /**
         * Server component:
         *
         * Launch is server side rendered with ?iss=<issuer> when the EPJ launches the application. We store the issuer
         * together with the current users session-ID to be able to verify the token at a later time.
         */
        await saveSessionIssuer(removeTrailingSlash(params.iss))
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
