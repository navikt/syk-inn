import React, { ReactElement } from 'react'
import { BodyShort, Detail, Heading } from '@navikt/ds-react'

import { pathWithBasePath } from '@lib/url'

type Props = {
    sykmeldingId: string
}

function PdfDebugView({ sykmeldingId }: Props): ReactElement {
    return (
        <div className="w-[65ch] max-w-prose pb-16">
            <Heading size="small">Forhåndsvisning av generert PDF</Heading>
            <Detail>Dette er en midlertidig utviklingsfeature som skal fjernes.</Detail>
            <BodyShort>
                For å se hvordan dokumentet ser ut i WebMed, gå på Pasientoversikten, og se på det øverste dokumentet.
            </BodyShort>
            <object
                data={pathWithBasePath(`/fhir/pdf/${sykmeldingId}`)}
                type="application/pdf"
                width="100%"
                height="100%"
            >
                <p>PDF cannot be displayed.</p>
            </object>
        </div>
    )
}

export default PdfDebugView
