import React, { ReactElement } from 'react'
import { Heading } from '@navikt/ds-react'

import Test from '@fhir/components/Test'

function Page(): ReactElement {
    return (
        <div className="p-8">
            <Heading level="2" size="medium" spacing>
                You are FHIR-ed
            </Heading>
            <Test />
        </div>
    )
}

export default Page
