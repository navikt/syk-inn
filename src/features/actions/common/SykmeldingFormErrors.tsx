import React, { ReactElement } from 'react'
import { Alert, BodyShort, Button, Heading } from '@navikt/ds-react'

import { AkselNextLink } from '@components/links/AkselNextLink'

export function SykmeldingFormErrors({ refetch }: { refetch: () => void }): ReactElement {
    return (
        <div className="grid grid-cols-2 gap-4 p-4">
            <div className="max-w-prose">
                <Alert variant="error">
                    <Heading level="3" size="medium" spacing>
                        Kunne ikke laste eksisterende sykmelding
                    </Heading>
                    <BodyShort>
                        Noe gikk galt ved lasting av skjema. Prøv å laste siden på nytt, eller kontakt support hvis
                        problemet vedvarer.
                    </BodyShort>
                    <div className="mt-4">
                        <Button size="xsmall" onClick={() => refetch()} variant="secondary-neutral">
                            Prøv på nytt
                        </Button>
                    </div>
                </Alert>
            </div>
        </div>
    )
}

export function SykmeldingDraftFormErrors({ refetch }: { refetch: () => void }): ReactElement {
    return (
        <div className="grid grid-cols-2 gap-4 p-4">
            <div className="max-w-prose">
                <Alert variant="error">
                    <Heading level="3" size="medium" spacing>
                        Kunne ikke laste utkast av sykmelding
                    </Heading>
                    <BodyShort spacing>
                        Gå tilbake til <AkselNextLink href="/fhir">oversikten</AkselNextLink> for å se alle dine
                        tilgjengelige utkast.
                    </BodyShort>
                    <BodyShort>
                        Noe gikk galt ved lasting av skjema. Prøv å laste siden på nytt, eller kontakt support hvis
                        problemet vedvarer.
                    </BodyShort>
                    <div className="mt-4">
                        <Button size="xsmall" onClick={() => refetch()} variant="secondary-neutral">
                            Prøv på nytt
                        </Button>
                    </div>
                </Alert>
            </div>
        </div>
    )
}
