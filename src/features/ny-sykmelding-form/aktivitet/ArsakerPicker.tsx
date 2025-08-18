import * as R from 'remeda'
import { Checkbox, CheckboxGroup, Textarea } from '@navikt/ds-react'
import { ReactElement } from 'react'

import { ArbeidsrelatertArsakType } from '@queries'

import { useController } from '../form'

function ArsakerPicker({ index }: { index: number }): ReactElement {
    const isMedisinskArsak = useController({
        name: `perioder.${index}.medisinskArsak.isMedisinskArsak`,
        rules: {
            validate: (value) => {
                if (!isArbeidsrelatertArsak.field.value && !value) {
                    return 'Du må velge minst én årsak'
                }
            },
        },
    })
    const isArbeidsrelatertArsak = useController({
        name: `perioder.${index}.arbeidsrelatertArsak.isArbeidsrelatertArsak`,
        rules: {
            validate: (value) => {
                if (!isMedisinskArsak.field.value && !value) {
                    return 'Du må velge minst én årsak'
                }
            },
        },
    })

    const arbeidsrelaterteArsaker = useController({
        name: `perioder.${index}.arbeidsrelatertArsak.arbeidsrelaterteArsaker`,
        defaultValue: [],
        rules: {
            validate: (value) => {
                if (isArbeidsrelatertArsak.field.value && (!value || value.length === 0)) {
                    return 'Du må velge minst én arbeidsrelatert årsak'
                }
            },
        },
    })

    const annenArbeidsrelatertArsak = useController({
        name: `perioder.${index}.arbeidsrelatertArsak.annenArbeidsrelatertArsak`,
        defaultValue: '',
        rules: {
            validate: (value) => {
                if (
                    isArbeidsrelatertArsak.field.value &&
                    (!value || value.trim() === '') &&
                    arbeidsrelaterteArsaker.field.value?.includes('ANNET')
                ) {
                    return 'Du må fylle inn annen arbeidsrelatert årsak'
                }
            },
        },
    })

    return (
        <div className="flex gap-1 flex-col">
            <CheckboxGroup
                legend="Medisinsk årsak"
                hideLegend
                value={isMedisinskArsak.field.value ? ['MEDISINSK'] : []}
                onChange={(value) => isMedisinskArsak.field.onChange(value.includes('MEDISINSK'))}
                error={isMedisinskArsak.fieldState.error?.message}
            >
                <Checkbox value="MEDISINSK">Medisinske årsaker forhindrer arbeidsaktivitet</Checkbox>
            </CheckboxGroup>
            <CheckboxGroup
                legend="Arbeidsrelatert årsak"
                hideLegend
                value={isArbeidsrelatertArsak.field.value ? ['ARBEID'] : []}
                onChange={(value) => isArbeidsrelatertArsak.field.onChange(value.includes('ARBEID'))}
                error={isArbeidsrelatertArsak.fieldState.error?.message}
            >
                <Checkbox value="ARBEID">Arbeidsrelaterte årsaker forhindrer arbeidsaktivitet</Checkbox>
            </CheckboxGroup>
            {isArbeidsrelatertArsak.field.value && (
                <CheckboxGroup
                    legend="Arbeidsrelaterte årsaker"
                    value={arbeidsrelaterteArsaker.field.value ?? []}
                    onChange={(value) => arbeidsrelaterteArsaker.field.onChange(value)}
                    error={arbeidsrelaterteArsaker.fieldState.error?.message}
                >
                    {R.keys(ArbeidsrelaterteArsaker).map((key) => (
                        <Checkbox key={key} value={key}>
                            {ArbeidsrelaterteArsaker[key]}
                        </Checkbox>
                    ))}
                </CheckboxGroup>
            )}
            {arbeidsrelaterteArsaker.field.value?.includes('ANNET') && (
                <Textarea
                    label="Annen arbeidsrelatert årsak"
                    value={annenArbeidsrelatertArsak.field.value ?? ''}
                    onChange={(e) => annenArbeidsrelatertArsak.field.onChange(e.target.value)}
                    error={annenArbeidsrelatertArsak.fieldState.error?.message}
                />
            )}
        </div>
    )
}

export const ArbeidsrelaterteArsaker: Record<ArbeidsrelatertArsakType, string> = {
    TILRETTELEGGING_IKKE_MULIG: 'Tilrettelegging ikke mulig',
    ANNET: 'Annet',
}

export default ArsakerPicker
