import React, { ReactElement } from 'react'
import { BodyShort, Link } from '@navikt/ds-react'

function LegeOgBehandlerTelefonen(): ReactElement {
    return (
        <>
            <BodyShort>
                Dersom problemet vedvarer, kan du kontakte{' '}
                <Link href="https://www.nav.no/samarbeidspartner/annen-informasjon-lege-og-behandler" target="_blank">
                    lege- og behandlertelefon
                </Link>{' '}
                på 55 55 33 36 (trykk 2) .
            </BodyShort>
        </>
    )
}

export default LegeOgBehandlerTelefonen
