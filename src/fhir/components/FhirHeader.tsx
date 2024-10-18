import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'

import { NavLogo } from '@fhir/components/NavLogo'

function FhirHeader(): ReactElement {
    return (
        <div className="border-b-2 border-b-border-subtle h-16 max-h-16 flex justify-between px-2">
            <div className="flex justify-center items-center gap-8">
                <NavLogo className="ml-2" />
                <Heading level="1" size="medium">
                    Innsending av Sykmelding - FHIR
                </Heading>
            </div>
            <div id="fhir-user-portal" />
        </div>
    )
}

export default FhirHeader
