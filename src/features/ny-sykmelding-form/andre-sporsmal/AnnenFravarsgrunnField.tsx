import React, { ReactElement } from 'react'
import { Checkbox, Fieldset, HelpText, Select, Link as AkselLink, BodyShort } from '@navikt/ds-react'
import { AnimatePresence } from 'motion/react'

import { useController } from '@features/ny-sykmelding-form/form/types'
import { SimpleReveal } from '@components/animation/Reveal'
import { AnnenFravarsgrunnArsak } from '@queries'
import { annenFravarsgrunnToText } from '@data-layer/common/annen-fravarsgrunn'

export function AnnenFravarsgrunnField(): ReactElement {
    const harFravarsgrunn = useController({
        name: 'annenFravarsgrunn.harFravarsgrunn',
    })

    return (
        <div>
            <Fieldset legend="Annen lovfestet fraværsgrunn" hideLegend>
                <Checkbox
                    {...harFravarsgrunn.field}
                    checked={harFravarsgrunn.field.value}
                    onChange={(event) => harFravarsgrunn.field.onChange(event.target.checked)}
                >
                    Sykmeldingen har en annen lovfestet fraværsgrunn
                </Checkbox>
                <AnimatePresence initial={false}>
                    {harFravarsgrunn.field.value && (
                        <SimpleReveal>
                            <AnnenLovfestetFravarsgrunn />
                        </SimpleReveal>
                    )}
                </AnimatePresence>
            </Fieldset>
        </div>
    )
}

function AnnenLovfestetFravarsgrunn(): ReactElement {
    const fravarsgrunn = useController({
        name: 'annenFravarsgrunn.fravarsgrunn',
        rules: {
            required: 'Du må velge en lovfestet fraværsgrunn',
        },
    })

    return (
        <Select
            label={
                <div className="flex items-center gap-2">
                    <BodyShort>Velg lovfestet fraværsgrunn</BodyShort>
                    <HelpText title="Hva er annen lovfestet fraværsgrunn?">
                        <BodyShort spacing>
                            Situasjoner som kan gi rett til sykepenger, selv om pasienten ikke er arbeidsufør på grunn
                            av sykdom eller skade.{' '}
                        </BodyShort>
                        <AkselLink
                            target="_blank"
                            href="https://www.nav.no/samarbeidspartner/om-sykmeldingen#spesielle-grunner"
                            className="inline"
                        >
                            Les mer om annen lovfestet fraværsgrunn på nav.no
                        </AkselLink>
                        .
                    </HelpText>
                </div>
            }
            className="mb-2"
            {...fravarsgrunn.field}
            value={fravarsgrunn.field.value ?? ''}
            onChange={fravarsgrunn.field.onChange}
            error={fravarsgrunn.fieldState.error?.message}
        >
            <option value="" disabled>
                Ingen grunn valgt
            </option>
            <Option grunn="GODKJENT_HELSEINSTITUSJON" />
            <Option grunn="BEHANDLING_FORHINDRER_ARBEID" />
            <Option grunn="MOTTAR_TILSKUDD_GRUNNET_HELSETILSTAND" />
            <Option grunn="ARBEIDSRETTET_TILTAK" />
            <Option grunn="NODVENDIG_KONTROLLUNDENRSOKELSE" />
            <Option grunn="SMITTEFARE" />
            <Option grunn="ABORT" />
            <Option grunn="UFOR_GRUNNET_BARNLOSHET" />
            <Option grunn="DONOR" />
            <Option grunn="BEHANDLING_STERILISERING" />
        </Select>
    )
}

function Option({ grunn }: { grunn: AnnenFravarsgrunnArsak }): ReactElement {
    return <option value={grunn}>{annenFravarsgrunnToText(grunn)}</option>
}
