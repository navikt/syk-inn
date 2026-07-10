import { Checkbox, CheckboxGroup, Textarea } from '@navikt/ds-react'
import { ReactElement } from 'react'

import { arbeidsrelaterteArsakerToText } from '#data-layer/common/arbeidsrelaterte-arsaker'
import { ArbeidsrelatertArsakType } from '#queries'

import { useController } from '../../form/types'

export function ArsakerPicker({ index }: { index: number }): ReactElement {
    const isArbeidsrelatertArsak = useController({
        name: `perioder.${index}.aktivitet.aktivitetIkkeMulig.isArbeidsrelatertArsak`,
    })

    const arbeidsrelaterteArsaker = useController({
        name: `perioder.${index}.aktivitet.aktivitetIkkeMulig.arbeidsrelaterteArsaker`,
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
        name: `perioder.${index}.aktivitet.aktivitetIkkeMulig.annenArbeidsrelatertArsak`,
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
                    legend="Arbeidsrelaterte årsaker (Vises for arbeidsgiver)"
                    value={arbeidsrelaterteArsaker.field.value ?? []}
                    onChange={(value) => arbeidsrelaterteArsaker.field.onChange(value)}
                    error={arbeidsrelaterteArsaker.fieldState.error?.message}
                >
                    <Checkbox value={'MANGLENDE_TILRETTELEGGING' satisfies ArbeidsrelatertArsakType}>
                        {arbeidsrelaterteArsakerToText('MANGLENDE_TILRETTELEGGING')}
                    </Checkbox>
                    <Checkbox value={'ANNET' satisfies ArbeidsrelatertArsakType}>
                        {arbeidsrelaterteArsakerToText('ANNET')}
                    </Checkbox>
                </CheckboxGroup>
            )}
            {arbeidsrelaterteArsaker.field.value?.includes('ANNET') && (
                <Textarea
                    label="Annen arbeidsrelatert årsak (Vises for arbeidsgiver)"
                    value={annenArbeidsrelatertArsak.field.value ?? ''}
                    onChange={(e) => annenArbeidsrelatertArsak.field.onChange(e.target.value)}
                    error={annenArbeidsrelatertArsak.fieldState.error?.message}
                />
            )}
        </div>
    )
}
