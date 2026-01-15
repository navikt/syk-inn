'use client'

import React, { ReactElement } from 'react'
import { PageBlock } from '@navikt/ds-react/Page'
import { BodyShort, Button, Heading } from '@navikt/ds-react'

export function NoBehandlerError(): ReactElement {
    return (
        <PageBlock as="main" width="xl" gutters className="pt-4">
            <div className="max-w-prose">
                <Heading size="large" spacing>
                    Du har blitt logget ut
                </Heading>
                <BodyShort spacing>Du har blitt logget ut av sykmeldingsløsningen for denne pasienten.</BodyShort>
                <BodyShort spacing>
                    Du kan prøve å laste siden på nytt, dersom dette ikke fungerer, må du må gjenåpne applikasjonen fra
                    ditt journalsystem.
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
