import React, { ReactElement, useState } from 'react'
import { BodyShort, DatePicker, Detail, RangeValidationT, useRangeDatepicker } from '@navikt/ds-react'
import { differenceInDays, format, isSameDay, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale/nb'
import { AnimatePresence } from 'motion/react'

import { dateOnly } from '@utils/date'
import { cn } from '@utils/tw'
import { parseShorthand } from '@components/ny-sykmelding-form/aktivitet/periode-shorthand'
import { SimpleReveal } from '@components/animation/Reveal'

import { PeriodeField, useController, useFormContext } from '../form'

import styles from './PeriodePicker.module.css'

function PeriodePicker({ index }: { index: number }): ReactElement {
    const [rangeError, setRangeError] = useState<RangeValidationT | null>(null)
    const { clearErrors } = useFormContext()
    const periodeField = useController({
        name: `perioder.${index}.periode` as const,
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

    const handleShorthandEvent = (event: React.KeyboardEvent<HTMLInputElement>): void => {
        if (event.key === 'Enter') {
            const shorthand = parseShorthand(event.currentTarget.value)
            if (shorthand) {
                event.preventDefault()
                event.stopPropagation()

                setSelected({
                    from: shorthand.from,
                    to: shorthand.to,
                })

                /**
                 * There might be a Aksel-bug where the datepicker does not update the error
                 * state when a valid date is entered using setSelected
                 */
                setRangeError(null)
                requestAnimationFrame(() => {
                    /**
                     * For some reason we have to manually trigger the validation in RHF as well
                     */
                    clearErrors(`perioder.${index}.periode`)
                })
            }
        }
    }

    const rangeDescription = getRangeDescription(periodeField?.field?.value ?? null)

    return (
        <div className="flex flex-col gap-1">
            <div className={cn(styles.periodePicker)}>
                <DatePicker {...datepickerProps} wrapperClassName={styles.dateRangePicker}>
                    <DatePicker.Input
                        className={styles.dateRangeInput}
                        {...fromInputProps}
                        label="Fra og med"
                        onBlur={periodeField.field.onBlur}
                        error={periodeField.fieldState.error?.message}
                        onKeyDown={(event) => {
                            handleShorthandEvent(event)
                        }}
                    />
                    <DatePicker.Input
                        className={styles.dateRangeInput}
                        {...toInputProps}
                        label="Til og med"
                        onBlur={periodeField.field.onBlur}
                        onKeyDown={(event) => {
                            handleShorthandEvent(event)
                        }}
                    />
                </DatePicker>
            </div>
            <AnimatePresence initial={false}>
                {rangeDescription && (
                    <SimpleReveal>
                        <BodyShort size="small">{rangeDescription.top}</BodyShort>
                        <Detail>{rangeDescription.bottom}</Detail>
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </div>
    )
}

function getRangeDescription(field: PeriodeField | null): { top: string; bottom: string } | null {
    if (field == null || field.fom == null || field.tom == null || field.fom === '' || field.tom === '') {
        return null
    }

    const isFomToday = isSameDay(field.fom, new Date())
    const isTomToday = isSameDay(field.tom, new Date())
    const daysInclusive = differenceInDays(field.tom, field.fom) + 1

    return {
        top: `${daysInclusive} dager`,
        bottom: `Fra ${format(field.fom, 'EEEE d. MMMM', { locale: nb })}${isFomToday ? ' (i dag)' : ''} til ${format(field.tom, 'EEEE d. MMMM', { locale: nb })}${isTomToday ? ' (i dag)' : ''}`,
    }
}

export default PeriodePicker
