import React, { ReactElement } from 'react'
import { TextField } from '@navikt/ds-react'

import { useController } from '../NySykmeldingFormValues'

function ArbeidsgiverManuellInputSection(): ReactElement {
    const navnField = useController({
        name: 'arbeidssituasjon.arbeidsgiver.navn',
        rules: {
            required: 'Du må fylle inn arbeidsgiver',
        },
    })
    const stillingField = useController({
        name: 'arbeidssituasjon.arbeidsgiver.stilling',
        rules: {
            required: 'Du må fille inn yrke/stilling',
        },
    })
    const stillingsprosentField = useController({
        name: 'arbeidssituasjon.arbeidsgiver.stillingsprosent',
        rules: {
            required: 'Du må fylle inn stillingsprosent',
        },
    })

    return (
        <div className="flex flex-col gap-3 mt-3">
            <TextField
                label="Arbeidsgiver"
                {...navnField.field}
                value={navnField.field.value ?? ''}
                error={navnField.fieldState.error?.message}
            />
            <TextField
                label="Yrke/stilling for dette arbeidsforholdet"
                {...stillingField.field}
                value={stillingField.field.value ?? ''}
                error={stillingField.fieldState.error?.message}
            />
            <TextField
                label="Stillingsprosent"
                {...stillingsprosentField.field}
                value={stillingsprosentField.field.value ?? ''}
                error={stillingsprosentField.fieldState.error?.message}
            />
        </div>
    )
}

export default ArbeidsgiverManuellInputSection
