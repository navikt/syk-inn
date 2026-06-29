import { Radio, RadioGroup } from '@navikt/ds-react'
import { AnimatePresence } from 'motion/react'
import React, { ReactElement } from 'react'

import { SimpleReveal } from '#components/animation/Reveal'
import { GradertGradPicker } from '#features/ny-sykmelding-form/sections/aktivitet/GradertGradPicker'

import { useController, useFormContext } from '../../form/types'

export function ReisetilskuddType(): ReactElement {
    const form = useFormContext()
    const type = useController({
        name: 'perioder.0.aktivitet.type',
    })

    return (
        <div>
            <RadioGroup
                className="mb-4"
                legend="Mulighet for arbeid ved bruk av reisetilskudd"
                error={type.fieldState.error?.message}
                {...type.field}
                onChange={(value: typeof type.field.value) => {
                    type.field.onChange(value)
                    form.setValue('perioder.0.aktivitet.gradert.reisetilskudd', value === 'GRADERT')
                }}
            >
                <Radio value={'REISETILSKUDD' satisfies typeof type.field.value}>Kan være 100% i arbeid</Radio>
                <Radio value={'GRADERT' satisfies typeof type.field.value}>Kan jobbe gradert</Radio>
            </RadioGroup>
            <AnimatePresence initial={false}>
                {type.field.value === 'GRADERT' && (
                    <SimpleReveal>
                        <GradertGradPicker
                            className="mb-4"
                            label="Sykmeldingsgrad ved bruk av reisetilskudd"
                            index={0}
                        />
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </div>
    )
}
