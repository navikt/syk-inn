'use client'

import React, { ReactElement } from 'react'
import { Alert, BodyLong, Button, Heading } from '@navikt/ds-react'

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
                        onClick={() => window.location.reload()}
                        size="xsmall"
                        variant="secondary-neutral"
                        type="button"
                    >
                        restarte applikasjonen på nytt
                    </Button>{' '}
                    her.
                </BodyLong>
            </Alert>
        </div>
    )
}
