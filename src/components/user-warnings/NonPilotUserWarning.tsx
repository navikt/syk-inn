'use client'

import React, { ReactElement } from 'react'
import { BodyLong, Modal, Link as AkselLink } from '@navikt/ds-react'
import { TestFlaskIcon } from '@navikt/aksel-icons'

import { useFlag } from '@toggles/context'

function NonPilotUserWarning(): ReactElement | null {
    const isPilotUser = useFlag('PILOT_USER')

    // Toggle is enabled, user has pilot-access
    if (isPilotUser.enabled) {
        return null
    }

    return (
        <Modal
            open={true}
            onClose={() => void 0}
            onKeyDown={(e) => {
                e.preventDefault()
                e.stopPropagation()
            }}
            closeOnBackdropClick={false}
            header={{
                icon: <TestFlaskIcon aria-hidden />,
                heading: 'Ny sykmelding – Pilot',
                closeButton: false,
                label: 'Du har ikke tilgang til denne løsningen',
            }}
            width="medium"
        >
            <Modal.Body>
                <BodyLong spacing>
                    Nav utvikler en ny løsning for digitale sykmeldinger, og vi har startet en pilot med et utvalg
                    leger. Foreløpig er det kun disse som har tilgang til applikasjonen.
                </BodyLong>

                <BodyLong>
                    Vi planlegger å utvide piloten etter hvert. Dersom du ønsker å bidra med testing og gi innspill til
                    den nye løsningen, er du velkommen til å sende en e-post til
                    <AkselLink href="mailto:erik.haug@nav.no">erik.haug@nav.no</AkselLink>.
                </BodyLong>
            </Modal.Body>
        </Modal>
    )
}

export default NonPilotUserWarning
