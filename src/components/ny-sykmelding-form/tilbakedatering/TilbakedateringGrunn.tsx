import { TextField } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useController } from '@components/ny-sykmelding-form/form'

function TilbakedateringGrunn(): ReactElement {
    const { field, fieldState } = useController({
        name: 'tilbakedatering.grunn' as const,
        rules: {
            validate: (value) => {
                if (value == null) return `Du må velge grunn for tilbakedatering`
            },
        },
    })

    return (
        <TextField
            label="Oppgi årsak for tilbakedatering"
            onChange={field.onChange}
            value={field.value ?? ''}
            error={fieldState.error?.message}
        />
    )
}

export default TilbakedateringGrunn
