import React, { ReactElement } from 'react'
import { Select } from '@navikt/ds-react'
import { AnimatePresence } from 'motion/react'

import { SimpleReveal } from '@components/animation/Reveal'

import ArsakerPicker from '../aktivitet/ArsakerPicker'
import GradertGradPicker from '../aktivitet/GradertGradPicker'
import { AktivitetIkkeMuligType, useController, useFormContext } from '../form'

function AktivitetPicker({ index }: { index: number }): ReactElement {
    const form = useFormContext()
    const aktivitetField = useController({
        name: `perioder.${index}.aktivitet.type`,
        defaultValue: 'AKTIVITET_IKKE_MULIG' satisfies AktivitetIkkeMuligType,
        rules: {
            required: 'Du må velge en aktivitetstype',
        },
    })

    return (
        <div className="grid grid-cols-[30ch_1fr] gap-4 mt-2">
            <Select
                label="Mulighet for arbeid"
                className="flex flex-col"
                value={aktivitetField.field.value}
                onChange={(event) => {
                    aktivitetField.field.onChange(event.target.value)
                    if (event.target.value === 'AKTIVITET_IKKE_MULIG') {
                        form.setValue(`perioder.${index}.medisinskArsak.isMedisinskArsak`, true)
                    }
                }}
            >
                <option value={'GRADERT' satisfies AktivitetIkkeMuligType}>Gradert sykmelding</option>
                <option value={'AKTIVITET_IKKE_MULIG' satisfies AktivitetIkkeMuligType}>Aktivitet ikke mulig</option>
            </Select>
            <AnimatePresence initial={false}>
                {aktivitetField.field.value === 'GRADERT' && (
                    <SimpleReveal>
                        <GradertGradPicker index={index} />
                    </SimpleReveal>
                )}
                {aktivitetField.field.value === 'AKTIVITET_IKKE_MULIG' && (
                    <SimpleReveal className="col-span-2">
                        <ArsakerPicker index={index} />
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AktivitetPicker
