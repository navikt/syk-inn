import React, { ReactElement } from 'react'
import { ReadMore, Switch, Textarea } from '@navikt/ds-react'

import { useFormContext } from '../form'

function MeldingTilNavField(): ReactElement {
    const form = useFormContext()
    const showTilNav = form.watch('meldinger.showTilNav')

    return (
        <div className="max-w-prose bg-bg-subtle rounded-xl py-2 px-5">
            <Switch position="right" {...form.register('meldinger.showTilNav')}>
                Melding til Nav
            </Switch>

            {showTilNav && (
                <div className="flex flex-col gap-4">
                    <Textarea
                        label={<p className="sr-only">Melding til Nav</p>}
                        description="Behov for tiltak, dialogmøte eller annen oppfølging fra Nav. Her kan det også gis andre opplysninger til Nav du mener er nødvendige."
                        {...form.register('meldinger.tilNav')}
                    />
                    <ReadMore header="Hva gjør Nav med denne informasjonen?" className="mb-2">
                        Når du har fylt ut dette feltet, blir det opprettet en oppgave til veileder på Nav-kontoret med
                        informasjon om hva det gjelder. Hvis Nav har behov for mer informasjon vil du bli kontaktet.
                    </ReadMore>
                </div>
            )}
        </div>
    )
}

export default MeldingTilNavField
