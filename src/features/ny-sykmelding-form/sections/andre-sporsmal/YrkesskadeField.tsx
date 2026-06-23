import { CheckmarkCircleIcon } from '@navikt/aksel-icons'
import { BodyShort, Checkbox, DatePicker, Fieldset, HelpText, Link, useDatepicker } from '@navikt/ds-react'
import { parseISO } from 'date-fns'
import { AnimatePresence } from 'motion/react'
import React, { ReactElement } from 'react'

import { SimpleReveal } from '#components/animation/Reveal'
import { useController } from '#features/ny-sykmelding-form/form/types'
import { dateOnly, toReadableDate } from '#lib/date'

export function YrkesskadeField({ className }: { className?: string }): ReactElement {
    const harYrkesskade = useController({
        name: 'andreSporsmal.yrkesskade.yrkesskade',
    })

    return (
        <div className={className}>
            <Fieldset legend="Yrkesskade" hideLegend>
                <Checkbox
                    {...harYrkesskade.field}
                    checked={harYrkesskade.field.value}
                    onChange={(event) => harYrkesskade.field.onChange(event.target.checked)}
                >
                    Sykmeldingen kan skyldes en yrkesskade/yrkessykdom
                    <HelpText wrapperClassName="inline-block ml-1 align-middle">
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
                </Checkbox>
                <AnimatePresence initial={false}>
                    {harYrkesskade.field.value && (
                        <SimpleReveal>
                            <YrkesskadeDatoPicker />
                        </SimpleReveal>
                    )}
                </AnimatePresence>
            </Fieldset>
        </div>
    )
}

function YrkesskadeDatoPicker(): ReactElement {
    const { field } = useController({
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
