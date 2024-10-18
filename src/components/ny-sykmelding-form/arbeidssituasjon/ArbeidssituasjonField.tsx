import React, { ReactElement } from 'react'
import { ToggleGroup } from '@navikt/ds-react'

import { useController } from '../NySykmeldingFormValues'

function ArbeidssituasjonField(): ReactElement {
    const arbeidssituasjon = useController({
        name: 'arbeidssituasjon.situasjon',
        defaultValue: 'en',
    })

    return (
        <div>
            <ToggleGroup {...arbeidssituasjon.field} variant="neutral">
                <ToggleGroup.Item value="en" label="Èn arbeidsgiver" />
                <ToggleGroup.Item value="flere" label="Flere arbeidsgivere" />
                <ToggleGroup.Item value="ingen" label="Ingen arbeidsgiver" />
            </ToggleGroup>
        </div>
    )
}

export default ArbeidssituasjonField
