import React, { ReactElement } from 'react'
import { BodyShort } from '@navikt/ds-react'

import { DetailedAlert } from '@components/help/GeneralErrors'

export function NoActivePasientWarning(): ReactElement | null {
    return (
        <DetailedAlert level="warning" title="Ingen pasient er valgt">
            <BodyShort spacing>
                Det har skjedd en feil under oppstart av sykmeldingsskjemaet. Dette skal ikke skje.
            </BodyShort>
            <BodyShort spacing>Prøv å start skjemaet på nytt, eller kontakt support dersom feilen vedvarer.</BodyShort>
        </DetailedAlert>
    )
}
