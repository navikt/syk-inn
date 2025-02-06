import React, { ReactElement, useEffect, useRef } from 'react'
import { Button, Detail } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'

import { useController, useFormContext } from '@components/ny-sykmelding-form/NySykmeldingFormValues'
import DiagnoseCombobox from '@components/ny-sykmelding-form/diagnose/combobox/DiagnoseCombobox'

import { KonsultasjonInfo } from '../../../data-fetcher/data-service'

const DIAGNOSE_SUGGESTION_LIST_ENABLED = false

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

    useInitialDiagnosePreFill(suggestedDiagnoser)

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
            {DIAGNOSE_SUGGESTION_LIST_ENABLED && (
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
            )}
        </>
    )
}

function useInitialDiagnosePreFill(suggestedDiagnoser: KonsultasjonInfo['diagnoser'] | null | null): void {
    const { setValue } = useFormContext()
    const initialSuggestedDiagnoser = useRef(suggestedDiagnoser)

    useEffect(() => {
        if (initialSuggestedDiagnoser.current == null || initialSuggestedDiagnoser.current.length === 0) return

        const [first] = initialSuggestedDiagnoser.current

        logger.info(
            `Got ${initialSuggestedDiagnoser.current.length} suggested diagnoser, prefilling with ${first.tekst}`,
        )

        setValue('diagnoser.hoved', {
            code: first.kode,
            system: first.system,
            text: first.tekst,
        })
    }, [setValue])
}

export default DiagnoseSmartPicker
