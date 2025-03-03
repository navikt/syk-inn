import React, { ReactElement, useState } from 'react'
import { Button, DatePicker, Heading, RangeValidationT, useRangeDatepicker } from '@navikt/ds-react'
import { Control, useController } from 'react-hook-form'
import { addDays, addWeeks, endOfWeek, format, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale/nb'

import { dateOnly } from '@utils/date'
import { cn } from '@utils/tw'

import { AktivitetFormValues } from './AktivitetSection'
import styles from './PeriodePicker.module.css'

export type PeriodeField = {
    fom: string
    tom: string
}

type Props = {
    control: Control<AktivitetFormValues>
}

function PeriodePicker({ control }: Props): ReactElement {
    const [rangeError, setRangeError] = useState<RangeValidationT | null>(null)
    const periodeField = useController({
        control,
        name: 'periode',
        rules: {
            validate: (value) => {
                if (rangeError?.from.isInvalid) {
                    return 'Fra og med dato må være en gyldig dato'
                }

                if (rangeError?.to.isInvalid) {
                    return 'Til og med dato må være en gyldig dato'
                }

                if (value == null || !value.fom) {
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
        defaultSelected: {
            from: periodeField.field.value?.fom ? parseISO(periodeField.field.value.fom) : undefined,
            to: periodeField.field.value?.tom ? parseISO(periodeField.field.value.tom) : undefined,
        },
        onRangeChange: (range) => {
            if (!range) {
                periodeField.field.onChange({
                    fom: null,
                    tom: null,
                })
                return
            }

            periodeField.field.onChange({
                fom: range.from ? dateOnly(range.from) : null,
                tom: range.to ? dateOnly(range.to) : null,
            })
        },
        onValidate: (range) => {
            setRangeError(range)
        },
    })

    return (
        <div>
            <Heading size="small" level="3" spacing>
                Periode
            </Heading>
            <div className={cn(styles.periodePicker)}>
                <DatePicker {...datepickerProps} wrapperClassName={styles.dateRangePicker}>
                    <DatePicker.Input
                        className={styles.dateRangeInput}
                        {...fromInputProps}
                        label="Fra og med"
                        onBlur={periodeField.field.onBlur}
                        error={periodeField.fieldState.error?.message}
                    />
                    <DatePicker.Input
                        className={styles.dateRangeInput}
                        {...toInputProps}
                        label="Til og med"
                        onBlur={periodeField.field.onBlur}
                    />
                </DatePicker>
            </div>
            <div className="mb-3 flex gap-3 w-[52ch]">
                <Button
                    variant="secondary-neutral"
                    size="small"
                    type="button"
                    className="grow"
                    onClick={() => {
                        const today = new Date()
                        const tom = addDays(today, 3)

                        setSelected({
                            from: today,
                            to: tom,
                        })
                    }}
                    autoFocus
                >
                    3 dager
                </Button>
                <Button
                    variant="secondary-neutral"
                    size="small"
                    type="button"
                    className="grow"
                    onClick={() => {
                        const today = new Date()
                        const tom = endOfWeek(today)

                        setSelected({
                            from: today,
                            to: tom,
                        })
                    }}
                >
                    Til og med søndag
                </Button>
                <Button
                    variant="secondary-neutral"
                    size="small"
                    type="button"
                    className="grow"
                    onClick={() => {
                        const today = new Date()
                        const tom = addWeeks(today, 1)

                        setSelected({
                            from: today,
                            to: tom,
                        })
                    }}
                >
                    1 uke (tom. {format(addWeeks(new Date(), 1), 'EEEE', { locale: nb })})
                </Button>
            </div>
        </div>
    )
}

export default PeriodePicker
