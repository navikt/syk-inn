import { Checkbox, HelpText, Link } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useController } from '#features/ny-sykmelding-form/form/types'

export function FriskmeldingTilArbeidsformidling(): ReactElement {
    const friskmeldingTilArbeidsformidling = useController({
        name: 'andreSporsmal.friskmeldingTilArbeidsformidling',
    })

    return (
        <div>
            <Checkbox
                {...friskmeldingTilArbeidsformidling.field}
                checked={friskmeldingTilArbeidsformidling.field.value}
                onChange={(event) => friskmeldingTilArbeidsformidling.field.onChange(event.target.checked)}
            >
                Kan pasienten bli frisk ved bytte av arbeid/arbeidsgiver
                <HelpText wrapperClassName="inline-block ml-1 align-middle">
                    Denne ordningen er aktuell hvis helsen til pasienten er slik at hen kan komme tilbake i arbeid, men
                    ikke til den jobben hen er sykmeldt fra.
                    <Link
                        href="https://www.nav.no/friskmelding-arbeidsformidling"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        Les mer om friskmelding til arbeidsformidling
                    </Link>
                </HelpText>
            </Checkbox>
        </div>
    )
}
