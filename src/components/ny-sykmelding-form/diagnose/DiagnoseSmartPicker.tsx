import React, { ReactElement } from 'react'
import { Button, Detail } from '@navikt/ds-react'

import { useController } from '@components/ny-sykmelding-form/NySykmeldingFormValues'
import DiagnoseCombobox from '@components/ny-sykmelding-form/diagnose/combobox/DiagnoseCombobox'
import { KonsultasjonInfo } from '@components/ny-sykmelding-form/data-provider/NySykmeldingFormDataService'

type Props = {
    suggestedDiagnoser: KonsultasjonInfo['diagnoser'] | null
}

function DiagnoseSmartPicker({ suggestedDiagnoser }: Props): ReactElement {
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
            <div className="mt-2">
                <Detail>Foreslåtte diagnoser</Detail>
                <div className="flex flex-wrap gap-2">
                    {suggestedDiagnoser?.map((it) => (
                        <Button
                            key={`${it.kode}-${it.system}`}
                            variant="secondary-neutral"
                            size="small"
                            type="button"
                            onClick={() => {
                                field.onChange({
                                    code: it.kode,
                                    system: it.system,
                                    text: it.tekst,
                                })
                            }}
                        >
                            {it.kode}: {it.tekst} ({it.kode})
                        </Button>
                    ))}
                </div>
            </div>
        </>
    )
}

export default DiagnoseSmartPicker
