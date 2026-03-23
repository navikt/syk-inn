import * as R from 'remeda'
import React, { ReactElement } from 'react'
import { BodyShort, Checkbox, CheckboxGroup, DatePicker, HelpText, Link, useDatepicker } from '@navikt/ds-react'
import { parseISO } from 'date-fns'
import { AnimatePresence } from 'motion/react'
import { CheckmarkCircleIcon } from '@navikt/aksel-icons'

import { dateOnly, toReadableDate } from '@lib/date'
import { SimpleReveal } from '@components/animation/Reveal'

import { useController } from '../form/types'

export function AndreSporsmalField(): ReactElement {
    const andreSporsmal = useController({
        name: 'andreSporsmal',
    })

    const fieldValue = [
        andreSporsmal.field.value?.yrkesskade?.yrkesskade ? 'yrkesskade' : null,
        andreSporsmal.field.value?.svangerskapsrelatert ? 'svangerskapsrelatert' : null,
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
                            skadedato: andreSporsmal.field.value?.yrkesskade?.skadedato ?? null,
                        },
                    })
                }}
                value={fieldValue}
            >
                <Checkbox value="svangerskapsrelatert">Sykdommen er svangerskapsrelatert</Checkbox>
                <div className="flex gap-1 items-center">
                    <Checkbox value="yrkesskade">Sykmeldingen kan skyldes en yrkesskade/yrkessykdom </Checkbox>
                    <HelpText>
                        Kryss av hvis en ny eller tidligere yrkesskade eller yrkessykdom kan være årsaken til
                        arbeidsuførheten. Du trenger ikke å vite om skaden eller sykdommen er godkjent av Nav. Les mer
                        om yrkesskade og yrkessykdom på{' '}
                        <Link
                            href="https://www.nav.no/samarbeidspartner/yrkesskade"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            nav.no
                        </Link>
                    </HelpText>
                </div>
            </CheckboxGroup>
            {andreSporsmal.field.value?.yrkesskade?.yrkesskade && <YrkesskadeDatoPicker />}
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
                    label={
                        <div className="flex gap-1 items-center">
                            Eventuell skadedato{' '}
                            <HelpText>
                                Oppgi dato for når yrkesskaden skjedde. Hvis du er usikker, oppgi omtrentlig tidspunkt.
                                Ved yrkessykdom kan du oppgi datoen for legekonsultasjonen når sykdommen ble konstatert.
                            </HelpText>
                        </div>
                    }
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
