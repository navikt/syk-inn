import React, { ReactElement } from 'react'

import DiagnoseCombobox from '@components/form/diagnose-combobox/DiagnoseCombobox'

import { useController } from '../form'

function DiagnosePicker(): ReactElement {
    const { field, fieldState } = useController({
        name: 'diagnoser.hoved',
        rules: {
            validate: (value) => {
                if (value?.code == null) return `Du må velge en diagnosekode`
            },
        },
    })

    return (
        <>
            <DiagnoseCombobox
                id="diagnoser.hoved"
                label="Hoveddiagnose"
                description="Diagnosekoder fra både  ICPC-2 og ICD-10."
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
        </>
    )
}

export default DiagnosePicker
