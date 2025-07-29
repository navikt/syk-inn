import React, { ReactElement } from 'react'
import { Alert } from '@navikt/ds-react'

export function DocumentStatusSuccess(): ReactElement {
    return <Alert variant="info">Sykmeldingdokument er lagret i EPJ-systemet</Alert>
}
