import React, { ReactElement } from 'react'
import { Heading, Textarea } from '@navikt/ds-react'

import { useFormContext } from '../form'

function MeldingTilNavField(): ReactElement {
    const form = useFormContext()

    return (
        <div className="max-w-prose">
            <Heading size="small">Melding til Nav</Heading>
            <Textarea
                label="Har du noen tilbakemeldinger?"
                description="For eksempel om det er behov for tiltak, dialogmøter eller annen oppfølging fra Nav. Her kan du også gi andre opplysninger til Nav, for eksempel vurdering av prognose."
                {...form.register('meldinger.tilNav')}
            />
        </div>
    )
}

export default MeldingTilNavField
