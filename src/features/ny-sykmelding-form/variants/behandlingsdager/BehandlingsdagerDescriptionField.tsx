import React, { ReactElement } from 'react'
import { ReadMore, Textarea } from '@navikt/ds-react'

import { useFormContext } from '@features/ny-sykmelding-form/form/types'

function BehandlingsdagerDescriptionField(): ReactElement {
    const form = useFormContext()

    return (
        <div className="flex flex-col gap-4">
            <Textarea
                label="Beskrivelse av behov for behandlingsdager (ikke påkrevd)"
                description="Beskriv kort hvilken behandling pasienten skal få, hvilket helsepersonell som skal utføre behandlingen, og hvorfor det gjør det nødvendig med fravær fra arbeid hele dagen."
                {...form.register('meldinger.tilNav')}
                maxLength={500}
            />
            <ReadMore header="Hvorfor ber vi om dette?" className="mb-2">
                Lorem
            </ReadMore>
        </div>
    )
}

export default BehandlingsdagerDescriptionField
