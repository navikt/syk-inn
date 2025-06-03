import React, { ReactElement } from 'react'
import { Switch, Textarea } from '@navikt/ds-react'

import { useFormContext } from '../form'

function MeldingTilNavField(): ReactElement {
    const form = useFormContext()
    const showTilNav = form.watch('meldinger.showTilNav')

    return (
        <div className="max-w-prose">
            <Switch position="right" {...form.register('meldinger.showTilNav')}>
                Melding til Nav
            </Switch>

            {showTilNav && (
                <Textarea
                    label="Har du noen tilbakemeldinger?"
                    description="For eksempel om det er behov for tiltak, dialogmøter eller annen oppfølging fra Nav. Her kan du også gi andre opplysninger til Nav, for eksempel vurdering av prognose."
                    {...form.register('meldinger.tilNav')}
                />
            )}
        </div>
    )
}

export default MeldingTilNavField
