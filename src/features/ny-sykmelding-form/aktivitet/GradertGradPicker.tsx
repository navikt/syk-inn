import { ReactElement } from 'react'
import { BodyShort, TextField } from '@navikt/ds-react'
import { AnimatePresence } from 'motion/react'

import { SimpleReveal } from '@components/animation/Reveal'

import { useController } from '../form/types'

function GradertGradPicker({ index }: { index: number }): ReactElement {
    const gradertField = useController({
        name: `perioder.${index}.aktivitet.grad` as const,
        defaultValue: '50',
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

    const coercedValue = safeGetPercentValue(gradertField.field.value ?? null)

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
            <AnimatePresence initial={false}>
                {coercedValue != null && gradertField.fieldState.error?.message == null && (
                    <SimpleReveal>
                        <BodyShort size="small">{100 - coercedValue}% i arbeid</BodyShort>
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </div>
    )
}

function safeGetPercentValue(value: string | null): number | null {
    if (!value) return null
    if (isNaN(Number(value))) return null

    return Number(value)
}

export default GradertGradPicker
