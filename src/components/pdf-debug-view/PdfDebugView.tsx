import React, { ReactElement } from 'react'
import { BodyShort, Detail, Heading } from '@navikt/ds-react'

import { pathWithBasePath } from '@utils/url'

type Props = {
    sykmeldingId: string
}

function PdfDebugView({ sykmeldingId }: Props): ReactElement {
    return (
        <div className="w-1/2 pb-16">
            <Heading size="small">PDF visning for sykmelding</Heading>
            <Detail>Denne visningen er kun for demo, og skal fjernes.</Detail>
            <BodyShort>Dette er dokumentet som vil bli lastet opp til WebMed</BodyShort>
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
