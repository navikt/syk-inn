import React, { ReactElement } from 'react'
import { Control, useController } from 'react-hook-form'
import { BodyShort, Detail, Heading, Radio, RadioGroup, TextField } from '@navikt/ds-react'

import { AktivitetFormValues } from './AktivitetSection'

export type AktivitetIkkeMuligType = 'AKTIVITET_IKKE_MULIG' | 'GRADERT'

export type AktivitetField = {
    type: AktivitetIkkeMuligType
    grad: number
}

type Props = {
    control: Control<AktivitetFormValues>
}

function AktivitetPicker({ control }: Props): ReactElement {
    const aktivitetField = useController({
        control,
        name: 'aktivitet.type',
        defaultValue: 'AKTIVITET_IKKE_MULIG' satisfies AktivitetIkkeMuligType,
        rules: {
            required: 'Du må velge en aktivitetstype',
        },
    })

    return (
        <div className="mt-12">
            <Heading level="3" size="small" spacing>
                Mulighet for arbeid
            </Heading>

            <RadioGroup
                hideLegend
                legend="Aktivitetsbegrensning"
                value={aktivitetField.field.value}
                onChange={(value: AktivitetIkkeMuligType) => {
                    aktivitetField.field.onChange(value)
                }}
            >
                <Radio
                    value={'AKTIVITET_IKKE_MULIG' satisfies AktivitetIkkeMuligType}
                    description="100% sykmeldingsperiode"
                >
                    Aktivitet ikke mulig
                </Radio>
                <Radio
                    value={'GRADERT' satisfies AktivitetIkkeMuligType}
                    description="Gradert sykmeldingsperiode"
                    className="flex"
                >
                    <div>Noe mulighet for aktivitet</div>
                </Radio>
            </RadioGroup>

            {aktivitetField.field.value === 'GRADERT' && <GradertGradPicker control={control} />}
        </div>
    )
}

function GradertGradPicker({ control }: Pick<Props, 'control'>): ReactElement {
    const gradertField = useController({
        control,
        name: 'aktivitet.grad' as const,
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
        <div className="flex gap-3 items-end">
            <div className="w-[20ch]">
                <TextField
                    type="number"
                    label="Sykmeldingsgrad"
                    {...gradertField.field}
                    error={gradertField.fieldState.error?.message}
                />
            </div>
            {coercedValue != null && (
                <div className="mb-1">
                    <BodyShort>{100 - coercedValue}% i arbeid</BodyShort>
                    <Detail>
                        F.eks. {(37.5 / (100 / (100 - coercedValue))).toFixed(1)} timer i uken gitt 37.5 timers
                        arbeidsuke
                    </Detail>
                </div>
            )}
        </div>
    )
}

export default AktivitetPicker
