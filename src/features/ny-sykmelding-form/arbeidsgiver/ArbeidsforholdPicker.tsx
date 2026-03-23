import { HelpText, Radio, RadioGroup, TextField } from '@navikt/ds-react'
import { ReactElement } from 'react'

import { useController } from '../form/types'

function ArbeidsforholdPicker(): ReactElement {
    const harFlereArbeidsforhold = useController({
        name: 'arbeidsforhold.harFlereArbeidsforhold',
        defaultValue: null,
        rules: {
            required: 'Du må svare på om pasienten har flere arbeidsgivere',
        },
    })

    const sykmeldtFraArbeidsforhold = useController({
        name: 'arbeidsforhold.sykmeldtFraArbeidsforhold',
        rules: {
            validate: (value) => {
                if (harFlereArbeidsforhold.field.value === 'JA' && !value) {
                    return 'Du må fylle inn hvilken arbeidsgiver pasienten skal sykmeldes fra'
                }
            },
        },
    })

    return (
        <div className="flex flex-col gap-3">
            <RadioGroup
                legend={
                    <div className="flex gap-1">
                        Har pasienten flere arbeidsgivere?
                        <HelpText>
                            Hvis pasienten har flere arbeidsgivere og trenger flere sykmeldinger, må du svare JA og
                            skrive inn navnet på arbeidsgiveren. Hvis pasienten bare har en arbeidsgiver trenger du ikke
                            oppgi arbeidsgiverens navn.
                        </HelpText>
                    </div>
                }
                error={harFlereArbeidsforhold.fieldState.error?.message}
                {...harFlereArbeidsforhold.field}
            >
                <div className="flex gap-4">
                    <Radio value="JA">Ja</Radio>
                    <Radio value="NEI">Nei</Radio>
                </div>
            </RadioGroup>
            {harFlereArbeidsforhold.field.value === 'JA' && (
                <TextField
                    label="Hvilken arbeidsgiver skal pasienten sykmeldes fra?"
                    error={sykmeldtFraArbeidsforhold.fieldState.error?.message}
                    {...sykmeldtFraArbeidsforhold.field}
                    value={sykmeldtFraArbeidsforhold.field.value || ''}
                />
            )}
        </div>
    )
}

export default ArbeidsforholdPicker
