import { Radio, RadioGroup, Stack, Textarea } from '@navikt/ds-react'
import { ReactElement } from 'react'

import { useController } from '../form'

function ArbeidsforholdPicker(): ReactElement {
    const harFlereArbeidsforhold = useController({
        name: 'arbeidsforhold.harFlereArbeidsforhold',
        defaultValue: null,
        rules: {
            required: 'Du må svare på om pasienten har flere arbeidsforhold',
        },
    })

    const sykmeldtFraArbeidsforhold = useController({
        name: 'arbeidsforhold.sykmeldtFraArbeidsforhold',
        rules: {
            validate: (value) => {
                if (harFlereArbeidsforhold.field.value === 'JA' && !value) {
                    return 'Du må fylle inn hvilke arbeidsforhold pasienten skal sykmeldes fra'
                }
            },
        },
    })

    return (
        <div className="flex flex-col gap-3">
            <RadioGroup
                legend="Har pasienten flere arbeidsforhold?"
                error={harFlereArbeidsforhold.fieldState.error?.message}
                {...harFlereArbeidsforhold.field}
            >
                <Stack direction="row" gap="4">
                    <Radio value="JA">Ja</Radio>
                    <Radio value="NEI">Nei</Radio>
                </Stack>
            </RadioGroup>
            {harFlereArbeidsforhold.field.value === 'JA' && (
                <Textarea
                    label="Hvilke arbeidsforhold skal pasienten sykmeldes fra?"
                    error={sykmeldtFraArbeidsforhold.fieldState.error?.message}
                    {...sykmeldtFraArbeidsforhold.field}
                    value={sykmeldtFraArbeidsforhold.field.value || ''}
                />
            )}
        </div>
    )
}

export default ArbeidsforholdPicker
