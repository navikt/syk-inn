import { DatePicker, useDatepicker } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import { parseISO } from 'date-fns'

import { dateOnly } from '@lib/date'

import { useController } from '../form/types'

function TilbakedateringDate(): ReactElement {
    const { field, fieldState } = useController({
        name: 'tilbakedatering.fom' as const,
        rules: {
            validate: (value) => {
                if (value == null) return `Du må velge dato (mm.dd.yyyy) for når pasienten først tok kontakt`
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
        </DatePicker>
    )
}

export default TilbakedateringDate
