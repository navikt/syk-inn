import { BodyShort, DatePicker, useDatepicker } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { parseISO } from 'date-fns'

import { useController } from '@components/ny-sykmelding-form/form'
import { dateOnly, toReadableDate } from '@utils/date'

function TilbakedateringDate(): ReactElement {
    const { field, fieldState } = useController({
        name: 'tilbakedatering.fom' as const,
        rules: {
            validate: (value) => {
                if (value == null) return `Du må velge dato for når pasienten først tok kontakt`
            },
        },
    })

    const { datepickerProps, inputProps } = useDatepicker({
        defaultSelected: field.value ? parseISO(field.value) : undefined,
        onDateChange: (date) => {
            if (!date) {
                field.onChange(null)
                return
            }
            field.onChange(dateOnly(date))
        },
    })
    return (
        <DatePicker {...datepickerProps}>
            <DatePicker.Input
                {...inputProps}
                label="Når tok pasienten først kontakt?"
                onBlur={field.onBlur}
                error={fieldState.error?.message}
            />
            <AnimatePresence>
                {field.value && (
                    <motion.div
                        className="overflow-hidden"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                        <BodyShort className="mt-1 ml-2" size="small">
                            {toReadableDate(field.value)}
                        </BodyShort>
                    </motion.div>
                )}
            </AnimatePresence>
        </DatePicker>
    )
}

export default TilbakedateringDate
