import * as R from 'remeda'
import React, { ReactElement } from 'react'
import { BodyShort, Checkbox, CheckboxGroup, DatePicker, useDatepicker } from '@navikt/ds-react'
import { parseISO } from 'date-fns'
import { AnimatePresence } from 'motion/react'
import { CheckmarkCircleIcon } from '@navikt/aksel-icons'

import { dateOnly, toReadableDate } from '@lib/date'
import { SimpleReveal } from '@components/animation/Reveal'

import { useController } from '../form'

function AndreSporsmalField(): ReactElement {
    const andreSporsmal = useController<'andreSporsmal'>({
        name: 'andreSporsmal',
    })

    const fieldValue = [
        andreSporsmal.field.value.yrkesskade?.yrkesskade ? 'yrkesskade' : null,
        andreSporsmal.field.value.svangerskapsrelatert ? 'svangerskapsrelatert' : null,
    ].filter(R.isNonNull)

    return (
        <>
            <CheckboxGroup
                legend="Andre spørsmål relatert til sykmeldingen"
                hideLegend
                onChange={(value) => {
                    andreSporsmal.field.onChange({
                        svangerskapsrelatert: value.includes('svangerskapsrelatert'),
                        yrkesskade: {
                            yrkesskade: value.includes('yrkesskade'),
                            skadedato: andreSporsmal.field.value.yrkesskade?.skadedato ?? null,
                        },
                    })
                }}
                value={fieldValue}
            >
                <Checkbox value="svangerskapsrelatert">Sykdommen er svangerskapsrelatert</Checkbox>
                <Checkbox value="yrkesskade">Sykmeldingen kan skyldes en yrkesskade/yrkessykdom</Checkbox>
            </CheckboxGroup>
            {andreSporsmal.field.value.yrkesskade?.yrkesskade && <YrkesskadeDatoPicker />}
        </>
    )
}

function YrkesskadeDatoPicker(): ReactElement {
    const { field } = useController<'andreSporsmal.yrkesskade.skadedato'>({
        name: 'andreSporsmal.yrkesskade.skadedato',
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
        <>
            <DatePicker {...datepickerProps}>
                <DatePicker.Input
                    ref={field.ref}
                    name={field.name}
                    {...inputProps}
                    disabled={field.disabled}
                    onBlur={field.onBlur}
                    label="Dato for yrkesskade"
                />
            </DatePicker>
            <AnimatePresence initial={false}>
                {field.value != null && (
                    <SimpleReveal>
                        <BodyShort className="mt-1 ml-1 flex gap-1 items-center" size="small">
                            <CheckmarkCircleIcon aria-hidden />
                            {toReadableDate(field.value)}
                        </BodyShort>
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </>
    )
}

export default AndreSporsmalField
