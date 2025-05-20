import { DatePicker, useDatepicker } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useController } from '@components/ny-sykmelding-form/form'
import { dateOnly } from '@utils/date'

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
        defaultSelected: field.value ? new Date(field.value) : undefined,
        onDateChange: (date) => {
            if (!date) {
                field.onChange(null)
                return
            }
            field.onChange(dateOnly(date))
        },
    })
    return (
        <DatePicker {...datepickerProps} wrapperClassName={/*styles.dateRangePicker*/ ''}>
            <DatePicker.Input
                {...inputProps}
                className={/*styles.dateRangeInput*/ ''}
                label="Når tok pasienten først kontakt?"
                onBlur={field.onBlur}
                error={fieldState.error?.message}
            />
        </DatePicker>
    )
}

export default TilbakedateringDate
