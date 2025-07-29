import React, { ReactElement, useState } from 'react'
import { BodyShort, DatePicker, Detail, RangeValidationT, useRangeDatepicker } from '@navikt/ds-react'
import { differenceInDays, format, isSameDay, parseISO } from 'date-fns'
import { nb } from 'date-fns/locale/nb'
import { AnimatePresence } from 'motion/react'

import { dateOnly } from '@lib/date'
import { cn } from '@lib/tw'
import { SimpleReveal } from '@components/animation/Reveal'

import { parseShorthand } from '../aktivitet/periode-shorthand'
import { useController, useFormContext } from '../form'

import styles from './PeriodePicker.module.css'

function PeriodePicker({ index }: { index: number }): ReactElement {
    const [rangeError, setRangeError] = useState<RangeValidationT | null>(null)
    const { clearErrors } = useFormContext()

    const fomField = useController({
        name: `perioder.${index}.periode.fom` as const,
        rules: {
            validate: (value) => {
                if (rangeError?.from.isInvalid) {
                    return 'Fra og med dato må være en gyldig dato'
                }

                if (!value) {
                    return 'Du må fylle inn fra og med dato'
                }

                if (tomField.field.value && value > tomField.field.value) {
                    return 'Fra og med dato kan ikke være etter til og med dato'
                }
            },
        },
    })
    const tomField = useController({
        name: `perioder.${index}.periode.tom` as const,
        rules: {
            validate: (value) => {
                if (rangeError?.to.isInvalid) {
                    return 'Til og med dato må være en gyldig dato'
                }

                if (!value) {
                    return 'Du må fylle inn til og med dato'
                }
            },
        },
    })

    const { datepickerProps, toInputProps, fromInputProps, setSelected } = useRangeDatepicker({
        defaultSelected: {
            from: fomField.field.value ? parseISO(fomField.field.value) : undefined,
            to: tomField.field.value ? parseISO(tomField.field.value) : undefined,
        },
        onRangeChange: (range) => {
            if (!range) {
                fomField.field.onChange(null)
                tomField.field.onChange(null)
                return
            }

            if (range.from) fomField.field.onChange(dateOnly(range.from))
            if (range.to) tomField.field.onChange(dateOnly(range.to))
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

    const rangeDescription = getRangeDescription(fomField.field.value, tomField.field.value)

    return (
        <div className="flex flex-col gap-1">
            <div className={cn(styles.periodePicker)}>
                <DatePicker {...datepickerProps} wrapperClassName={styles.dateRangePicker}>
                    <DatePicker.Input
                        className={styles.dateRangeInput}
                        ref={fomField.field.ref}
                        name={fomField.field.name}
                        {...fromInputProps}
                        label="Fra og med"
                        onBlur={fomField.field.onBlur}
                        error={fomField.fieldState.error?.message}
                        onKeyDown={(event) => {
                            handleShorthandEvent(event)
                        }}
                    />
                    <DatePicker.Input
                        className={styles.dateRangeInput}
                        ref={tomField.field.ref}
                        name={tomField.field.name}
                        {...toInputProps}
                        label="Til og med"
                        onBlur={fomField.field.onBlur}
                        error={tomField.fieldState.error?.message}
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

function getRangeDescription(fom: string | null, tom: string | null): { top: string; bottom: string } | null {
    if (fom == null || tom == null || fom === '' || tom === '') {
        return null
    }

    const isFomToday = isSameDay(fom, new Date())
    const isTomToday = isSameDay(tom, new Date())
    const daysInclusive = differenceInDays(tom, fom) + 1

    return {
        top: daysInclusive === 1 ? '1 dag' : `${daysInclusive} dager`,
        bottom: `Fra ${format(fom, 'EEEE d. MMMM', { locale: nb })}${isFomToday ? ' (i dag)' : ''} til ${format(tom, 'EEEE d. MMMM', { locale: nb })}${isTomToday ? ' (i dag)' : ''}`,
    }
}

export default PeriodePicker
