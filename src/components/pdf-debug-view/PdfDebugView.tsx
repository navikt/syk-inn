import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'

type Props = {
    sykmeldingId: string
}

function PdfDebugView({ sykmeldingId }: Props): ReactElement {
    return (
        <div className="w-1/2 pb-8">
            <Heading size="small">PDF visning for sykmelding</Heading>
            <object data={`/fhir/pdf/${sykmeldingId}`} type="application/pdf" width="100%" height="100%">
                <p>PDF cannot be displayed.</p>
            </object>
        </div>
    )
}

export default PdfDebugView
