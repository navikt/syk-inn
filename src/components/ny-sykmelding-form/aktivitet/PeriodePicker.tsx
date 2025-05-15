import React, { ReactElement, useState } from 'react'
import { BodyShort, Button, DatePicker, RangeValidationT, useRangeDatepicker } from '@navikt/ds-react'
import { addDays, addWeeks, differenceInDays, endOfWeek, format, isSameDay, parseISO, subDays } from 'date-fns'
import { nb } from 'date-fns/locale/nb'
import { AnimatePresence, motion } from 'motion/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@navikt/aksel-icons'

import { dateOnly } from '@utils/date'
import { cn } from '@utils/tw'

import { PeriodeField, useController, useFormContext } from '../form'

import styles from './PeriodePicker.module.css'

function PeriodePicker(): ReactElement {
    const { control } = useFormContext()
    const [rangeError, setRangeError] = useState<RangeValidationT | null>(null)
    const periodeField = useController({
        control,
        name: 'perioder.0.periode' as const,
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

    const rangeDescription = getRangeDescription(periodeField?.field?.value ?? null)

    return (
        <div>
            <div className={cn(styles.periodePicker)}>
                <div className="flex items-end mr-2 -ml-2">
                    <Button
                        icon={<ChevronLeftIcon title="Forskyv fra dato en dag bak" />}
                        type="button"
                        variant="tertiary-neutral"
                        className="w-8"
                        onClick={() => {
                            const fom = subDays(periodeField.field.value?.fom ?? new Date(), 1)

                            setSelected({
                                from: fom,
                                to: periodeField.field.value?.tom ? parseISO(periodeField.field.value.tom) : undefined,
                            })
                        }}
                    />
                </div>
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
                <div className="flex items-end ml-2">
                    <Button
                        icon={<ChevronRightIcon title="Forskyv til-dato en dag frem" />}
                        type="button"
                        variant="tertiary-neutral"
                        className="w-8"
                        onClick={() => {
                            const tom = addDays(periodeField.field.value?.tom ?? new Date(), 1)

                            setSelected({
                                from: periodeField.field.value?.fom
                                    ? parseISO(periodeField.field.value.fom)
                                    : undefined,
                                to: tom,
                            })
                        }}
                    />
                </div>
            </div>
            <div className="mb-3 flex gap-3 w-[52ch] mt-4">
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
                        const tom = endOfWeek(today, { locale: nb })

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
            <AnimatePresence>
                {rangeDescription && (
                    <motion.div
                        className="overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                        <BodyShort className="ml-1" size="small">
                            {rangeDescription}
                        </BodyShort>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function getRangeDescription(field: PeriodeField | null): string | null {
    if (field == null || field.fom == null || field.tom == null) {
        return null
    }

    const isFomToday = isSameDay(field.fom, new Date())
    const isTomToday = isSameDay(field.tom, new Date())
    const daysInclusive = differenceInDays(field.tom, field.fom) + 1
    // F.eks: onsdag 5. mars (i dag) til fredag 7. mars
    return `${daysInclusive} dager fra ${format(field.fom, 'EEEE d. MMMM', { locale: nb })}${isFomToday ? ' (i dag)' : ''} til ${format(field.tom, 'EEEE d. MMMM', { locale: nb })}${isTomToday ? ' (i dag)' : ''}`
}

export default PeriodePicker
