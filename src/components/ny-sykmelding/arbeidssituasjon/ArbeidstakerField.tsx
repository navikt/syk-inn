import React, { PropsWithChildren, ReactElement } from 'react'
import { TextField } from '@navikt/ds-react'

import ArbeidssituasjonField from '@components/ny-sykmelding/arbeidssituasjon/ArbeidssituasjonField'

import { useController } from '../NySykmeldingFormValues'

function ArbeidstakerField({ children }: PropsWithChildren): ReactElement {
    const navnField = useController({
        name: 'arbeidsgiver.navn',
    })
    const stillingField = useController({
        name: 'arbeidsgiver.stilling',
    })
    const stillingsprosentField = useController({
        name: 'arbeidsgiver.stillingsprosent',
    })

    return (
        <div>
            {children}
            <ArbeidssituasjonField />
            <TextField label="Arbeidsgiver" {...navnField.field} value={navnField.field.value ?? ''} />
            <TextField
                label="Yrke/stilling for dette arbeidsforholdet"
                {...stillingField.field}
                value={stillingField.field.value ?? ''}
            />
            <TextField
                label="Stillingsprosent"
                {...stillingsprosentField.field}
                value={stillingsprosentField.field.value ?? ''}
            />
        </div>
    )
}

export default ArbeidstakerField
