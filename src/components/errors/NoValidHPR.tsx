'use client'

import React, { ReactElement } from 'react'
import { PageBlock } from '@navikt/ds-react/Page'
import { BodyShort, Button, Heading } from '@navikt/ds-react'

import { ModeType } from '@core/providers/Modes'
import { getAbsoluteURL, pathWithBasePath } from '@lib/url'
import { isDemo, isLocal } from '@lib/env'

export function NoValidHPR({ mode }: { mode: ModeType }): ReactElement {
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
                    <Button type="button" variant="secondary-neutral" onClick={() => window.location.reload()}>
                        Last siden på nytt
                    </Button>
                    {(isLocal || isDemo) && mode === 'FHIR' && (
                        <Button
                            type="button"
                            as="a"
                            variant="secondary-neutral"
                            href={pathWithBasePath(
                                `/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir&launch=local-dev-launch-espen`}`,
                            )}
                        >
                            Relaunch dev FHIR
                        </Button>
                    )}
                </div>
            </div>
        </PageBlock>
    )
}
