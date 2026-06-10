import React, { ReactElement } from 'react'
import { BodyShort, HelpText, ReadMore, Textarea } from '@navikt/ds-react'
import { Link as AkselLink } from '@navikt/ds-react/Link'

import { useFormContext } from '@features/ny-sykmelding-form/form/types'

function BehandlingsdagerDescriptionField(): ReactElement {
    const form = useFormContext()

    return (
        <div className="flex flex-col gap-4">
            <Textarea
                label={
                    <div className="flex gap-1">
                        <BodyShort weight="semibold">
                            Beskrivelse av behov for behandlingsdager (ikke påkrevd)
                        </BodyShort>
                        <HelpText title="Hva er annen lovfestet fraværsgrunn?">
                            <BodyShort spacing>
                                Hvis ikke det er oppgitt tilstrekkelig begrunnelse i sykmeldingen, vil Nav etterspørre
                                en slik begrunnelse i ettertid.
                            </BodyShort>
                            <AkselLink
                                target="_blank"
                                href="https://www.nav.no/samarbeidspartner/om-sykmeldingen#enkeltstaende-behandlingsdager"
                                className="inline"
                            >
                                Les mer om enkeltstående behandlingsdager på nav.no
                            </AkselLink>
                            .
                        </HelpText>
                    </div>
                }
                description="Beskriv kort hvilken behandling pasienten skal få og hvorfor det er nødvendig med fravær fra jobb hele arbeidsdagen."
                {...form.register('meldinger.tilNav')}
                maxLength={500}
            />
            <ReadMore header="Hvorfor spør vi om dette?" className="mb-2">
                For å ha rett til sykepenger ved enkeltstående behandlingsdager, må virkningen av behandlingen gjøre det
                nødvendig at man ikke arbeider. Dette omfatter tilfeller der den kurative effekten av behandlingen blir
                redusert hvis man arbeider, eller tilfeller der bivirkninger av behandlingen ikke gjør det mulig å
                arbeide.
            </ReadMore>
        </div>
    )
}

export default BehandlingsdagerDescriptionField
