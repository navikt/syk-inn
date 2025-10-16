'use client'

import React, { ReactElement } from 'react'
import { BodyLong, Button, Modal } from '@navikt/ds-react'

import { isLocal, isDemo } from '@lib/env'
import { getAbsoluteURL, pathWithBasePath } from '@lib/url'
import { useAppSelector } from '@core/redux/hooks'
import { useMode } from '@core/providers/Modes'
import { MockLaunchType } from '@navikt/fhir-mock-server/types'

function LoggedOutWarning(): ReactElement | null {
    const isSessionExpired = useAppSelector((state) => state.metadata.sessionExpired)
    const mode = useMode()

    if (!isSessionExpired) {
        return null
    }

    return (
        <Modal
            open
            onClose={() => void 0}
            header={{
                heading: 'Du har blitt logget ut',
                closeButton: false,
            }}
            width="small"
        >
            <Modal.Body>
                <BodyLong spacing>
                    {mode === 'FHIR'
                        ? 'Du har blitt logget ut av sykmeldingsløsningen for denne pasienten.'
                        : 'Du har blitt logget ut av sykmeldingsløsningen.'}
                </BodyLong>
                <BodyLong>
                    {mode === 'FHIR'
                        ? 'Du kan prøve å laste siden på nytt, dersom dette ikke fungerer, må du må gjenåpne applikasjonen fra ditt journalsystem.'
                        : 'Du kan laste siden på nytt for å logge inn igjen.'}
                </BodyLong>
            </Modal.Body>
            <Modal.Footer>
                <Button type="button" variant="secondary-neutral" onClick={() => window.location.reload()}>
                    {mode === 'FHIR' ? 'Last siden på nytt' : 'Logg inn igjen'}
                </Button>
                {(isLocal || isDemo) && mode === 'FHIR' && (
                    <Button
                        type="button"
                        as="a"
                        variant="secondary-neutral"
                        href={pathWithBasePath(
                            `/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir&launch=${`local-dev-launch:Espen Eksempel` satisfies MockLaunchType}`}`,
                        )}
                    >
                        Relaunch dev FHIR (Espen)
                    </Button>
                )}
            </Modal.Footer>
        </Modal>
    )
}

export default LoggedOutWarning
