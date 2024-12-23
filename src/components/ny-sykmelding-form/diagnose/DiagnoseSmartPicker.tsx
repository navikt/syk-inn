import React, { ReactElement } from 'react'

import { useController } from '@components/ny-sykmelding-form/NySykmeldingFormValues'
import DiagnoseCombobox from '@components/ny-sykmelding-form/diagnose/combobox/DiagnoseCombobox'

function DiagnoseSmartPicker(): ReactElement {
    const { field, fieldState } = useController({
        name: 'diagnoser.hoved',
        rules: {
            validate: (value) => {
                if (value?.code == null) return `Du må velge en diagnosekode`
            },
        },
    })

    return (
        <DiagnoseCombobox
            id="diagnoser.hoved"
            label="Hoveddiagnose"
            value={field.value}
            onBlur={field.onBlur}
            error={fieldState.error?.message}
            onSelect={(suggestion) => {
                field.onChange(suggestion)
            }}
            onChange={() => {
                if (field.value != null) {
                    field.onChange(null)
                }
            }}
        />
    )
}

export default DiagnoseSmartPicker
