import React, { ReactElement, useCallback, useState } from 'react'
import {
    Detail,
    DatePicker,
    Radio,
    RadioGroup,
    RangeValidationT,
    TextField,
    useRangeDatepicker,
    Button,
} from '@navikt/ds-react'
import { addWeeks } from 'date-fns'

import { cn } from '@utils/tw'
import { dateOnly } from '@utils/date'

import { AktivitetIkkeMuligType, useController, useFormContext } from '../NySykmeldingFormValues'

import styles from './AktivitetSection.module.css'

function AktivitetSection(): ReactElement {
    const { register } = useFormContext()
    const [rangeError, setRangeError] = useState<RangeValidationT | null>(null)
    const aktivitetField = useController({
        name: 'aktivitet',
        defaultValue: {
            type: 'AKTIVITET_IKKE_MULIG' satisfies AktivitetIkkeMuligType,
            fom: null,
            tom: null,
            grad: null,
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
    const { datepickerProps, toInputProps, fromInputProps, setSelected } = useRangeDatepicker({
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
                fom: range.from ? dateOnly(range.from) : null,
                tom: range.to ? dateOnly(range.to) : null,
            })
        },
        onValidate: (range) => {
            setRangeError(range)
        },
    })

    const setWeeks = useCallback(
        (weeks: number): void => {
            const today = new Date()
            const tom = addWeeks(today, weeks)

            setSelected({
                from: today,
                to: tom,
            })
        },
        [setSelected],
    )

    return (
        <div>
            <Detail spacing>Pasientens begrensninger i aktivitet</Detail>

            <div className={cn(styles.periodePicker)}>
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

            <div className="mb-3 flex gap-3 w-[42ch]">
                <Button
                    variant="secondary-neutral"
                    size="small"
                    type="button"
                    className="grow"
                    onClick={() => setWeeks(1)}
                >
                    1 uke
                </Button>
                <Button
                    variant="secondary-neutral"
                    size="small"
                    type="button"
                    className="grow"
                    onClick={() => setWeeks(2)}
                >
                    2 uker
                </Button>
                <Button
                    variant="secondary-neutral"
                    size="small"
                    type="button"
                    className="grow"
                    onClick={() => setWeeks(3)}
                >
                    3 uker
                </Button>
                <Button
                    variant="secondary-neutral"
                    size="small"
                    type="button"
                    className="grow"
                    onClick={() => setWeeks(4)}
                >
                    4 uker
                </Button>
            </div>

            <RadioGroup
                legend="Aktivitetsbegrensning"
                onChange={(value: AktivitetIkkeMuligType) => {
                    aktivitetField.field.onChange({
                        ...aktivitetField.field.value,
                        type: value,
                    })
                }}
                defaultValue={'AKTIVITET_IKKE_MULIG' satisfies AktivitetIkkeMuligType}
            >
                <Radio
                    value={'AKTIVITET_IKKE_MULIG' satisfies AktivitetIkkeMuligType}
                    description="100% sykmeldingsperiode"
                >
                    Aktivitet ikke mulig
                </Radio>
                <Radio
                    value={'GRADERT' satisfies AktivitetIkkeMuligType}
                    description="Gradert sykmeldingsperiode"
                    className="flex"
                >
                    <div>Noe mulighet for aktivitet</div>
                </Radio>
            </RadioGroup>

            {aktivitetField.field.value.type === 'GRADERT' && (
                <div className="w-[20ch]">
                    <TextField label="Sykmeldingsgrad" {...register('aktivitet.grad')} />
                </div>
            )}
        </div>
    )
}

export default AktivitetSection
