import React, { ReactElement, useState } from 'react'
import { BodyShort, DatePicker, Detail, Label, RangeValidationT, useRangeDatepicker } from '@navikt/ds-react'

import { useController } from '../NySykmeldingFormValues'

import styles from './AktivitetSection.module.css'

function AktivitetSection(): ReactElement {
    const [rangeError, setRangeError] = useState<RangeValidationT | null>(null)
    const aktivitetField = useController({
        name: 'aktivitet',
        defaultValue: {
            type: 'AKTIVITET_IKKE_MULIG',
            fom: null,
            tom: null,
        },
        rules: {
            validate: (value) => {
                if (rangeError?.from.isInvalid) {
                    return 'Fra og med dato må være en gyldig dato'
                }

                if (rangeError?.to.isInvalid) {
                    return 'Til og med dato må være en gyldig dato'
                }

                if (!value.fom) {
                    return 'Du må fylle inn fra og med dato'
                }
                if (!value.tom) {
                    return 'Du må fylle inn til og med dato'
                }
                if (value.fom > value.tom) {
                    return 'Fra og med dato kan ikke være etter til og med dato'
                }
            },
        },
    })
    const { datepickerProps, toInputProps, fromInputProps } = useRangeDatepicker({
        fromDate: new Date('Aug 23 2019'),
        onRangeChange: (range) => {
            if (!range) {
                aktivitetField.field.onChange({
                    ...aktivitetField.field.value,
                    fom: null,
                    tom: null,
                })
                return
            }

            aktivitetField.field.onChange({
                ...aktivitetField.field.value,
                fom: range.from,
                tom: range.to,
            })
        },
        onValidate: (range) => {
            setRangeError(range)
        },
    })

    return (
        <div>
            <Detail spacing>Pasientens begrensninger i aktivitet</Detail>

            <div className="flex items-center gap-1">
                <Label>Aktivitetstype:</Label>
                <BodyShort>Aktivitet ikke mulig</BodyShort>
            </div>

            <div className={styles.periodePicker}>
                <DatePicker {...datepickerProps} wrapperClassName={styles.dateRangePicker}>
                    <DatePicker.Input
                        className={styles.dateRangeInput}
                        {...fromInputProps}
                        label="Fra og med"
                        onBlur={aktivitetField.field.onBlur}
                        error={aktivitetField.fieldState.error?.message}
                    />
                    <DatePicker.Input
                        className={styles.dateRangeInput}
                        {...toInputProps}
                        label="Til og med"
                        onBlur={aktivitetField.field.onBlur}
                    />
                </DatePicker>
            </div>
        </div>
    )
}

export default AktivitetSection
