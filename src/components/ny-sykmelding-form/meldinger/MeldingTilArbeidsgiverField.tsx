import React, { ReactElement } from 'react'
import { Switch, Textarea } from '@navikt/ds-react'

import { useFormContext } from '../form'

function MeldingTilNavField(): ReactElement {
    const form = useFormContext()

    const showTilArbeidsgiver = form.watch('meldinger.showTilArbeidsgiver')

    return (
        <div className="max-w-prose">
            <Switch position="right" {...form.register('meldinger.showTilArbeidsgiver')}>
                Melding til arbeidsgiver
            </Switch>

            {showTilArbeidsgiver && (
                <Textarea
                    label="Innspill til arbeidsgiver"
                    description="For eksempel tilrettelegging som bør gjøres på arbeidsplassen"
                    {...form.register('meldinger.tilArbeidsgiver')}
                />
            )}
        </div>
    )
}

export default MeldingTilNavField
