import React, { ReactElement } from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'

import DiagnosePicker from './DiagnosePicker'

interface Props {
    diagnosePrefillError?: { error: 'FHIR_FAILED' }
}

function DiagnoseSection({ diagnosePrefillError }: Props): ReactElement {
    return (
        <section aria-labelledby="hoveddiagnose-section-heading">
            <Heading level="4" size="small" id="hoveddiagnose-section-heading">
                Hoveddiagnose
            </Heading>
            <DiagnosePicker />
            {diagnosePrefillError && (
                <BodyShort className="mt-2 flex gap-1 items-center">
                    <ExclamationmarkTriangleIcon aria-hidden />
                    Kunne ikke hente diagnoser, du kan fortsatt velge diagnosen manuelt.
                </BodyShort>
            )}
        </section>
    )
}

export default DiagnoseSection
