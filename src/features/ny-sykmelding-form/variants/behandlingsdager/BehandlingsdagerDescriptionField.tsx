import React, { ReactElement } from 'react'
import { ReadMore, Textarea } from '@navikt/ds-react'

import { useFormContext } from '@features/ny-sykmelding-form/form/types'

function BehandlingsdagerDescriptionField(): ReactElement {
    const form = useFormContext()

    return (
        <div className="flex flex-col gap-4">
            <Textarea
                label="Beskrivelse av behov for behandlingsdager (ikke påkrevd)"
                description="Beskriv kort hvilken behandling pasienten skal få og hvorfor det er nødvendig med fravær fra jobb."
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
