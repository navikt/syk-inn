'use client'

import React, { ReactElement } from 'react'
import { PageBlock } from '@navikt/ds-react/Page'
import { BodyShort, Button, Heading } from '@navikt/ds-react'

export function NoValidHPR(): ReactElement {
    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            <div className="max-w-prose">
                <Heading size="large" spacing>
                    Din bruker har ikke et gyldig HPR-nummer
                </Heading>
                <BodyShort spacing>
                    For å bruke denne løsningen må brukeren din ha et gyldig HPR-nummer registrert på brukeren din i
                    EPJ-systemet ditt.
                </BodyShort>
                <BodyShort spacing>
                    Du kan prøve å gjenåpne applikasjonen fra ditt journalsystem, eller kontakte din systemleverandør
                    for å få hjelp til å registrere et gyldig HPR-nummer.
                </BodyShort>
                <BodyShort className="italic" spacing>
                    Vedvarer problemet kan du kontakte lege- og behandlertelefonen til Nav.
                </BodyShort>
                <div className="flex gap-3 justify-end mt-8">
                    <Button
                        data-color="neutral"
                        type="button"
                        variant="secondary"
                        onClick={() => window.location.reload()}
                    >
                        Last siden på nytt
                    </Button>
                </div>
            </div>
        </PageBlock>
    )
}
