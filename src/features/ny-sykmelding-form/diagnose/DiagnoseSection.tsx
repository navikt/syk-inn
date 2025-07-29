import React, { ReactElement } from 'react'
import { BodyShort } from '@navikt/ds-react'
import { ExclamationmarkTriangleIcon } from '@navikt/aksel-icons'

import DiagnosePicker from './DiagnosePicker'

interface Props {
    diagnosePrefillError?: { error: 'FHIR_FAILED' }
}

function DiagnoseSection({ diagnosePrefillError }: Props): ReactElement {
    return (
        <>
            <DiagnosePicker />
            {diagnosePrefillError && (
                <BodyShort className="mt-2 flex gap-1 items-center">
                    <ExclamationmarkTriangleIcon aria-hidden />
                    Kunne ikke hente diagnoser, du kan fortsatt velge diagnosen manuelt.
                </BodyShort>
            )}
        </>
    )
}

export default DiagnoseSection
