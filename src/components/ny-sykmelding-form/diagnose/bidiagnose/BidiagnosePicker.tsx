import React, { PropsWithChildren, ReactElement } from 'react'
import { useController } from 'react-hook-form'

import DiagnoseCombobox from '@components/form/diagnose-combobox/DiagnoseCombobox'

function BidiagnosePicker({
    index,
    children,
    onSelect,
}: PropsWithChildren<{ index: number; onSelect: () => void }>): ReactElement {
    const { field, fieldState } = useController({
        name: `diagnoser.bidiagnoser.${index}`,
        rules: {
            validate: (val) => (val?.code ? true : 'Må velge en diagnose'),
        },
    })

    return (
        <DiagnoseCombobox
            id={`diagnoser.bidiagnoser.${index}`}
            label={`Bidiagnose ${index + 1}`}
            description="Diagnosekoder fra både ICPC-2 og ICD-10."
            className="max-w-prose"
            value={field.value}
            onSelect={(event) => {
                field.onChange(event)
                onSelect()
            }}
            onBlur={field.onBlur}
            onChange={() => {
                if (field.value != null) {
                    field.onChange(null)
                }
            }}
            error={fieldState.error?.message}
            actions={children}
        />
    )
}

export default BidiagnosePicker
