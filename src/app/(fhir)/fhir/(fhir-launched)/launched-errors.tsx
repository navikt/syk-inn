'use client'

import { PageBlock } from '@navikt/ds-react/Page'
import React, { ReactElement } from 'react'
import { BodyShort, Button, Heading } from '@navikt/ds-react'

import { isDemo, isLocal } from '@lib/env'
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
