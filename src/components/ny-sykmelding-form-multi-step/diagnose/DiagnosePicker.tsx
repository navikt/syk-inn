import React, { ReactElement } from 'react'
import { Control, useController } from 'react-hook-form'

import DiagnoseCombobox from '@components/ny-sykmelding-form/diagnose/combobox/DiagnoseCombobox'

import { KonsultasjonInfo } from '../../../data-fetcher/data-service'

import { DiagnoseFormValues } from './DiagnoseSection'

type Props = {
    control: Control<DiagnoseFormValues>
    suggestedDiagnoser: KonsultasjonInfo['diagnoser'] | null
}

function DiagnosePicker({ control }: Props): ReactElement {
    const { field, fieldState } = useController({
        control,
        name: 'hoved',
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
