import React, { ReactElement, useState } from 'react'
import { Alert, BodyShort, ProgressBar, Radio, RadioGroup, Select, Stack, TextField } from '@navikt/ds-react'
import { useQuery } from '@apollo/client'
import { AnimatePresence } from 'motion/react'

import { useController, useFormContext } from '@components/ny-sykmelding-form/form'
import { Arbeidsforhold, ArbeidsforholdDocument } from '@queries'
import { SimpleReveal } from '@components/animation/Reveal'

export function AaregArbeidsforholdPicker(): ReactElement {
    const harFlereArbeidsforhold = useController({
        name: 'arbeidsforhold.harFlereArbeidsforhold',
        defaultValue: null,
        rules: {
            required: 'Du må svare på om pasienten har flere arbeidsforhold',
        },
    })

    return (
        <div>
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
            <AnimatePresence initial={false}>
                {harFlereArbeidsforhold.field.value === 'JA' && (
                    <SimpleReveal>
                        <Aaron />
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </div>
    )
}

function Aaron(): ReactElement {
    const arbeidsforholdQuery = useQuery(ArbeidsforholdDocument)

    if (arbeidsforholdQuery.loading) {
        return <AaregLoading />
    }

    return <ArbeidsforholdFromAaregPicker arbeidsforhold={arbeidsforholdQuery.data?.pasient?.arbeidsforhold ?? []} />
}

function ArbeidsforholdFromAaregPicker({
    arbeidsforhold,
}: {
    arbeidsforhold: Pick<Arbeidsforhold, 'navn' | 'orgnummer'>[]
}): ReactElement {
    const hasAnyArbeidsgivere = arbeidsforhold.length > 0

    const formContext = useFormContext()
    const sykmeldtFraArbeidsforhold = useController({
        name: 'arbeidsforhold.aaregArbeidsforhold',
        rules: {
            required: hasAnyArbeidsgivere && 'Du må fylle inn hvilke arbeidsforhold pasienten skal sykmeldes fra',
        },
    })
    const annetArbeidsforhold = useController({
        name: 'arbeidsforhold.sykmeldtFraArbeidsforhold',
        rules: {
            validate: (value) => {
                if ((sykmeldtFraArbeidsforhold.field.value === 'annet' || !hasAnyArbeidsgivere) && !value) {
                    return 'Du må fylle inn hvilket arbeidsforhold pasienten skal sykmeldes fra'
                }
            },
        },
    })

    return (
        <>
            {arbeidsforhold.length > 1 ? (
                <Select
                    className="&>.onavds-select__container:w-64"
                    label="Hvilke arbeidsforhold skal pasienten sykmeldes fra?"
                    value={sykmeldtFraArbeidsforhold.field.value ?? ''}
                    onChange={(event) => {
                        sykmeldtFraArbeidsforhold.field.onChange(event)
                        if (event.target.value !== 'annet') {
                            annetArbeidsforhold.field.onChange(event)
                        } else {
                            requestAnimationFrame(() => {
                                formContext.setFocus('arbeidsforhold.sykmeldtFraArbeidsforhold', { shouldSelect: true })
                            })
                        }
                    }}
                    onBlur={sykmeldtFraArbeidsforhold.field.onBlur}
                    error={sykmeldtFraArbeidsforhold.fieldState.error?.message}
                >
                    <option value="" disabled defaultChecked>
                        Velg arbeidsforhold
                    </option>
                    {arbeidsforhold.map((af) => (
                        <option key={af.orgnummer} value={af.navn}>
                            {af.navn} ({af.orgnummer})
                        </option>
                    ))}
                    <option value="annet">Annet arbeidsforhold</option>
                </Select>
            ) : (
                <Alert variant="info" className="mt-2">
                    <BodyShort spacing>
                        Vi fant ingene arbeidsforhold i arbeidsgiverregisteret. Du kan manuelt skrive inn navnet på
                        arbeidsgiveren.
                    </BodyShort>
                    <BodyShort>
                        Pasienten må du be arbeidsgiveren sin om å registrere ansettelsesforholdet i A-meldingen som
                        sendes til Altinn.
                    </BodyShort>
                </Alert>
            )}
            <AnimatePresence>
                {(sykmeldtFraArbeidsforhold.field.value === 'annet' || arbeidsforhold.length === 0) && (
                    <SimpleReveal>
                        <TextField
                            {...annetArbeidsforhold.field}
                            ref={annetArbeidsforhold.field.ref}
                            className="mt-2"
                            label=""
                            description="Siden vi ikke fant rett arbeidsforhold i arbeidsgiverregisteret, må du fylle inn hvilket arbeidsforhold pasienten skal sykmeldes fra."
                            error={annetArbeidsforhold.fieldState.error?.message}
                            value={annetArbeidsforhold.field.value || ''}
                        />
                    </SimpleReveal>
                )}
            </AnimatePresence>
        </>
    )
}

function AaregLoading(): ReactElement {
    const [tookALongTime, setSlow] = useState(false)
    return (
        <div>
            <BodyShort id="aareg-loading-text" spacing>
                {!tookALongTime ? 'Henter arbeidsforhold...' : 'Arbeidsgiverregisterene er litt trege i dag...'}
            </BodyShort>
            <ProgressBar
                simulated={{ seconds: 3, onTimeout: () => setSlow(true) }}
                aria-labelledby="aareg-loading-text"
            />
        </div>
    )
}
