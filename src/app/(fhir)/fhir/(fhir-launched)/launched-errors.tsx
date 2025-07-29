'use client'

import { PageBlock } from '@navikt/ds-react/Page'
import React, { ReactElement } from 'react'
import { BodyShort, Button, Heading } from '@navikt/ds-react'

import { isLocal, isDemo } from '@lib/env'
import { getAbsoluteURL, pathWithBasePath } from '@lib/url'

export function NoPractitionerSession(): ReactElement {
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
                    <Button type="button" variant="secondary-neutral" onClick={() => window.location.reload()}>
                        Last siden på nytt
                    </Button>
                    {(isLocal || isDemo) && (
                        <Button
                            type="button"
                            as="a"
                            variant="secondary-neutral"
                            href={pathWithBasePath(
                                `/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir&launch=local-dev-id`}`,
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
                    <Button type="button" variant="secondary-neutral" onClick={() => window.location.reload()}>
                        Last siden på nytt
                    </Button>
                    {(isLocal || isDemo) && (
                        <Button
                            type="button"
                            as="a"
                            variant="secondary-neutral"
                            href={pathWithBasePath(
                                `/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir&launch=local-dev-id`}`,
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
