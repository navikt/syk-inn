import React, { ReactElement } from 'react'
import { BodyShort } from '@navikt/ds-react'

import { AkselNextLink } from '@components/links/AkselNextLink'
import { DetailedAlert, SimpleAlert } from '@components/help/GeneralErrors'
import { useMode } from '@core/providers/Modes'

export function SykmeldingFormErrors({ refetch }: { refetch: () => void }): ReactElement {
    return (
        <div className="grid grid-cols-2 gap-4 p-4">
            <div className="max-w-prose">
                <SimpleAlert level="error" title="Kunne ikke laste eksisterende sykmelding" retry={refetch}>
                    Noe gikk galt ved lasting av skjema. Prøv å laste siden på nytt, eller kontakt support hvis
                    problemet vedvarer.
                </SimpleAlert>
            </div>
        </div>
    )
}

export function SykmeldingDraftFormErrors({ refetch }: { refetch: () => void }): ReactElement {
    const mode = useMode()

    return (
        <div className="grid grid-cols-2 gap-4 p-4">
            <div className="max-w-prose">
                <DetailedAlert
                    level="error"
                    title="Kunne ikke laste utkast av sykmelding"
                    retry={refetch}
                    noCallToAction
                >
                    <BodyShort spacing>
                        Gå tilbake til <AkselNextLink href={mode.paths.root}>oversikten</AkselNextLink> for å se alle
                        dine tilgjengelige utkast.
                    </BodyShort>
                    <BodyShort>
                        Noe gikk galt ved lasting av skjema. Prøv å laste siden på nytt, eller kontakt support hvis
                        problemet vedvarer.
                    </BodyShort>
                </DetailedAlert>
            </div>
        </div>
    )
}
