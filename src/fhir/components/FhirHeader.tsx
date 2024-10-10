import React, { ReactElement } from 'react'
import Image from 'next/image'
import { Heading } from '@navikt/ds-react'

function FhirHeader(): ReactElement {
    return (
        <div className="border-b-2 border-b-border-subtle h-16 max-h-16 flex items-center px-2">
            <div>
                <Image
                    src="https://emoji.slack-edge.com/T5LNAMWNA/erik_ser_deg/d868fac0c3a5279e.png"
                    alt="syk-inn FHIR Logo"
                    unoptimized
                    fill
                    className="max-h-16 max-w-16"
                />
                <Heading level="1" size="large" className="ml-16">
                    Innsending av Sykmelding - FHIR
                </Heading>
            </div>
        </div>
    )
}

export default FhirHeader
