import React, { ReactElement } from 'react'
import { Heading, Textarea } from '@navikt/ds-react'

import { useFormContext } from '../form'

function MeldingTilNavField(): ReactElement {
    const form = useFormContext()

    return (
        <div className="max-w-prose">
            <Heading size="small">Melding til arbeidsgiver</Heading>
            <Textarea
                label="Innspill til arbeidsgiver"
                description="For eksempel tilrettelegging som bør gjøres på arbeidsplassen"
                {...form.register('meldinger.tilArbeidsgiver')}
            />
        </div>
    )
}

export default MeldingTilNavField
