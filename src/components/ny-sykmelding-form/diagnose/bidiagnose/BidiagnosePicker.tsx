import React, { ReactElement } from 'react'
import { useController } from 'react-hook-form'

import DiagnoseCombobox from '@components/form/diagnose-combobox/DiagnoseCombobox'

function BidiagnosePicker({ index }: { index: number }): ReactElement {
    const { field, fieldState } = useController({
        name: `diagnoser.bidiagnoser.${index}`,
        rules: {
            validate: (val) => (val?.code ? true : 'Må velge en diagnose'),
        },
    })

    return (
        <DiagnoseCombobox
            id={`diagnoser.bidiagnoser.${index}`}
            label="Bidiagnose"
            description="Diagnosekoder fra både ICPC-2 og ICD-10."
            className="max-w-prose"
            value={field.value}
            onSelect={field.onChange}
            onBlur={field.onBlur}
            onChange={() => {
                if (field.value != null) {
                    field.onChange(null)
                }
            }}
            error={fieldState.error?.message}
        />
    )
}

export default BidiagnosePicker
