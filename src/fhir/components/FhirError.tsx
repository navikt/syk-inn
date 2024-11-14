'use client'

import React, { ReactElement } from 'react'
import { Alert, BodyLong, Button, Heading } from '@navikt/ds-react'

import { getAbsoluteURL } from '@utils/url'
import { getSmartSession } from '@fhir/auth/session'

export function FhirError(): ReactElement {
    return (
        <div className="max-w-prose">
            <Alert variant="error">
                <Heading level="3" size="small">
                    Smart-innlogging (FHIR) feilet under oppstart
                </Heading>
                <BodyLong spacing>
                    Denne feilen gjør at du ikke vil kunne sende inn sykmeldingen. Dersom problemet vedvarer, ta kontakt
                    enten med NAV brukerstøtte, eller hos brukerstøtte hos din EPJ-leverandør.
                </BodyLong>
                <BodyLong>
                    Du kan prøve å starte applikasjonen på nytt i din EPJ, eller så kan prøve å{' '}
                    <Button
                        as="a"
                        href={getReInitializationURL()}
                        size="xsmall"
                        variant="secondary-neutral"
                        type="button"
                    >
                        restarte applikasjonen
                    </Button>{' '}
                    her.
                </BodyLong>
            </Alert>
        </div>
    )
}

function getReInitializationURL(): string {
    const iss = getSmartSession().serverUrl

    return `${getAbsoluteURL()}/fhir/launch?iss=${iss}`
}
