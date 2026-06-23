import { Checkbox } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useController } from '#features/ny-sykmelding-form/form/types'

export function SvangerskapsrelatertField(): ReactElement {
    const svangerskapsrelatert = useController({
        name: 'andreSporsmal.svangerskapsrelatert',
    })

    return (
        <Checkbox
            {...svangerskapsrelatert.field}
            checked={svangerskapsrelatert.field.value}
            onChange={(event) => svangerskapsrelatert.field.onChange(event.target.checked)}
        >
            Sykdommen er svangerskapsrelatert
        </Checkbox>
    )
}
