import React, { ReactElement } from 'react'
import { BodyShort, Select, TextField } from '@navikt/ds-react'
import { AnimatePresence } from 'motion/react'

import { SimpleReveal } from '@components/animation/Reveal'

import { AktivitetIkkeMuligType, useController } from '../form'

function AktivitetPicker({ index }: { index: number }): ReactElement {
    const aktivitetField = useController({
        name: `perioder.${index}.aktivitet.type`,
        defaultValue: 'AKTIVITET_IKKE_MULIG' satisfies AktivitetIkkeMuligType,
        rules: {
            required: 'Du må velge en aktivitetstype',
        },
    })

    return (
        <div className="flex gap-8 mt-2">
            <Select
                label="Mulighet for arbeid"
                className="w-60 flex flex-col mb-6"
                value={aktivitetField.field.value}
                onChange={(event) => {
                    aktivitetField.field.onChange(event.target.value)
                }}
            >
                <option value={'GRADERT' satisfies AktivitetIkkeMuligType}>Gradert sykmelding</option>
                <option value={'AKTIVITET_IKKE_MULIG' satisfies AktivitetIkkeMuligType}>Aktivitet ikke mulig</option>
            </Select>
            <AnimatePresence>
                {aktivitetField.field.value === 'GRADERT' && (
                    <SimpleReveal>
                        <GradertGradPicker index={index} />
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </div>
    )
}

function GradertGradPicker({ index }: { index: number }): ReactElement {
    const gradertField = useController({
        name: `perioder.${index}.aktivitet.grad` as const,
        defaultValue: 50,
        rules: {
            required: 'Du må fylle inn sykmeldingsgrad',
            pattern: {
                value: /^[0-9]*$/,
                message: 'Sykmeldingsgraden må være et tall',
            },
            min: {
                value: 1,
                message: 'Sykmeldingsgraden må være minst 1',
            },
            max: {
                value: 99,
                message: 'Sykmeldingsgraden kan ikke være mer enn 99',
            },
        },
    })

    const coercedValue =
        gradertField.field.value != null && gradertField.field.value > 0 && gradertField.field.value <= 99
            ? gradertField.field.value
            : null

    return (
        <div className="flex flex-col gap-1">
            <TextField
                inputMode="numeric"
                label="Sykmeldingsgrad (%)"
                className="[&>input]:w-[7ch]"
                {...gradertField.field}
                value={gradertField.field.value ?? ''}
                error={gradertField.fieldState.error?.message}
            />
            <AnimatePresence>
                {coercedValue != null && (
                    <SimpleReveal>
                        <BodyShort size="small">{100 - coercedValue}% i arbeid</BodyShort>
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </div>
    )
}

export default AktivitetPicker
