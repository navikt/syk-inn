import React, { ReactElement, RefObject, useImperativeHandle, useRef, useState } from 'react'
import { BodyShort, DatePicker, Detail, RangeValidationT, useRangeDatepicker } from '@navikt/ds-react'
import { addDays, differenceInDays, parseISO, isBefore, toDate } from 'date-fns'
import { AnimatePresence } from 'motion/react'
import { RefCallBack } from 'react-hook-form'

import { dateOnly } from '@lib/date'
import { cn } from '@lib/tw'
import { SimpleReveal } from '@components/animation/Reveal'

import { useController, useFormContext } from '../form/types'

import { parseShorthandFom, parseShorthandTom } from './periode/periode-shorthand'
import { getRangeDescription } from './periode/periode-utils'
import { ShorthandHint } from './ShorthandHint'
import styles from './PeriodePicker.module.css'

type Props = {
    index: number
    initialFom: string | null
}

function PeriodePicker({ index, initialFom }: Props): ReactElement {
    const [rangeError, setRangeError] = useState<RangeValidationT | null>(null)
    const { clearErrors } = useFormContext()
    const previousTomPlusOne = useNextFomFromPreviousPeriode(initialFom, index)

    const fomField = useController({
        name: `perioder.${index}.periode.fom` as const,
        rules: {
            validate: (value) => {
                if (!value) return 'Du må fylle inn fra og med dato'

                if (rangeError?.from.isInvalid) return 'Fra og med dato må være en gyldig dato'
                if (rangeError?.from.isDisabled) return 'Periode kan ikke overlappe med forrige periode'
                if (rangeError?.to.isBeforeFrom) return 'Fra og med dato kan ikke være etter til og med dato'

                if (previousTomPlusOne && isBefore(value, previousTomPlusOne)) {
                    return 'Periode kan ikke overlappe med forrige periode'
                }

                if (previousTomPlusOne && differenceInDays(value, previousTomPlusOne) > 0) {
                    return 'Det kan ikke være opphold mellom perioder'
                }
            },
        },
    })
    const tomField = useController({
        name: `perioder.${index}.periode.tom` as const,
        rules: {
            validate: (value) => {
                if (rangeError?.to.isBeforeFrom) return
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
        disabled: previousTomPlusOne ? [{ before: toDate(previousTomPlusOne) }] : undefined,
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

    const handleShorthandEvent = (event: React.KeyboardEvent<HTMLInputElement>, side: 'fom' | 'tom'): void => {
        if (event.key === 'Enter') {
            const shorthand =
                side === 'fom'
                    ? parseShorthandFom(previousTomPlusOne, event.currentTarget.value)
                    : parseShorthandTom(previousTomPlusOne, fomField.field.value, event.currentTarget.value)

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

    const { focusState, handleFocusState, handleBlurState } = useFocusState()
    const { fomFieldRef, tomFieldRef } = useFieldRefs(fomField.field.ref, tomField.field.ref)
    const rangeDescription = getRangeDescription(fomField.field.value, tomField.field.value)

    return (
        <div className="flex flex-col gap-1">
            <div className={cn(styles.periodePicker)}>
                <DatePicker {...datepickerProps} wrapperClassName={styles.dateRangePicker}>
                    <DatePicker.Input
                        className={styles.dateRangeInput}
                        ref={fomFieldRef}
                        name={fomField.field.name}
                        {...fromInputProps}
                        label="Fra og med"
                        onFocus={() => handleFocusState('fom')}
                        onBlur={() => {
                            handleBlurState()
                            fomField.field.onBlur()
                        }}
                        error={fomField.fieldState.error?.message}
                        onKeyDown={(event) => {
                            handleShorthandEvent(event, 'fom')
                        }}
                    />
                    <ShorthandHint
                        anchorEl={fomFieldRef.current}
                        focused={focusState === 'fom'}
                        suggestion={parseShorthandFom(
                            previousTomPlusOne,
                            typeof fromInputProps.value === 'string' ? fromInputProps.value : null,
                        )}
                    />
                    <DatePicker.Input
                        className={styles.dateRangeInput}
                        ref={tomFieldRef}
                        name={tomField.field.name}
                        {...toInputProps}
                        label="Til og med"
                        onFocus={() => handleFocusState('tom')}
                        onBlur={() => {
                            handleBlurState()
                            fomField.field.onBlur()
                        }}
                        error={tomField.fieldState.error?.message}
                        onKeyDown={(event) => {
                            handleShorthandEvent(event, 'tom')
                        }}
                    />
                    <ShorthandHint
                        anchorEl={tomFieldRef.current}
                        focused={focusState === 'tom'}
                        suggestion={parseShorthandTom(
                            previousTomPlusOne,
                            fomField.field.value,
                            typeof toInputProps.value === 'string' ? toInputProps.value : null,
                        )}
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

function useFieldRefs(
    fomField: RefCallBack,
    tomField: RefCallBack,
): {
    fomFieldRef: RefObject<HTMLInputElement | null>
    tomFieldRef: RefObject<HTMLInputElement | null>
} {
    /**
     * We want to be able to share refs between RHF and ourselves, so we use `useImperativeHandle`
     *
     * See: https://react-hook-form.com/faqs#Howtosharerefusage
     */
    const fomFieldRef = useRef<HTMLInputElement>(null)
    const tomFieldRef = useRef<HTMLInputElement>(null)

    useImperativeHandle(fomField, () => fomFieldRef.current)
    useImperativeHandle(tomField, () => tomFieldRef.current)

    return { fomFieldRef, tomFieldRef }
}

function useFocusState(): {
    focusState: 'fom' | 'tom' | null
    handleFocusState: (side: 'fom' | 'tom') => void
    handleBlurState: () => void
} {
    const [focusState, setFocusState] = useState<'fom' | 'tom' | null>(null)

    const handleFocusState = (side: 'fom' | 'tom'): void => {
        setFocusState(side)
    }

    const handleBlurState = (): void => {
        setFocusState(null)
    }

    return { focusState, handleFocusState, handleBlurState }
}

/**
 * Infers the "previous" fom, only the first item in the periode pickers should care about the initialFom (typically
 * when a sykmelding is being created based on a previous sykmelding). Other periods should only care about the previous
 * periode's tom + 1 day.
 */
function useNextFomFromPreviousPeriode(initialFom: string | null, index: number): string | null {
    const { watch } = useFormContext()

    const previousTomValue = index >= 1 ? watch(`perioder.${index - 1}.periode.tom` as const) : null
    const previousPlusOne = previousTomValue ? dateOnly(addDays(previousTomValue, 1)) : null

    if (index === 0) {
        return initialFom ?? previousPlusOne ?? null
    } else {
        return previousPlusOne ?? null
    }
}

export default PeriodePicker
