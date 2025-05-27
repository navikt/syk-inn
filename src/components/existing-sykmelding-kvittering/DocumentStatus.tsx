import React, { ReactElement } from 'react'
import { Alert, Heading } from '@navikt/ds-react'

export function DocumentStatusSuccess(): ReactElement {
    return (
        <Alert className="mt-4" variant="info">
            <Heading size="small" level="3">
                Sykmeldingdokument er lagret i EPJ-systemet
            </Heading>
        </Alert>
    )
}
