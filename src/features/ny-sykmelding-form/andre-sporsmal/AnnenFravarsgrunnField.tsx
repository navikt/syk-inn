import React, { ReactElement } from 'react'
import { Checkbox, Fieldset, Select } from '@navikt/ds-react'
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
            label="Velg fraværsgrunn"
            className="mb-2"
            {...fravarsgrunn.field}
            value={fravarsgrunn.field.value ?? ''}
            onChange={fravarsgrunn.field.onChange}
            error={fravarsgrunn.fieldState.error?.message}
        >
            <option value="" disabled>
                Velg fraværsgrunn
            </option>
            <Option grunn="ABORT" />
            <Option grunn="ARBEIDSRETTET_TILTAK" />
            <Option grunn="BEHANDLING_STERILISERING" />
            <Option grunn="DONOR" />
            <Option grunn="GODKJENT_HELSEINSTITUSJON" />
            <Option grunn="MOTTAR_TILSKUDD_GRUNNET_HELSETILSTAND" />
            <Option grunn="NODVENDIG_KONTROLLUNDENRSOKELSE" />
            <Option grunn="SMITTEFARE" />
            <Option grunn="UFOR_GRUNNET_BARNLOSHET" />
        </Select>
    )
}

function Option({ grunn }: { grunn: AnnenFravarsgrunnArsak }): ReactElement {
    return <option value={grunn}>{annenFravarsgrunnToText(grunn)}</option>
}
