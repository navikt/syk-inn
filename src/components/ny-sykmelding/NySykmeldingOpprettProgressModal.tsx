import React, { ReactElement, useState } from 'react'
import { BodyShort, Modal } from '@navikt/ds-react'

import useInterval from '@utils/hooks/useInterval'

import styles from './NySykmeldingOpprettProgressModal.module.css'

const funnyLoadingMessagesNorwegian = [
    'Sender inn data...',
    'Sjekker at kontoret er åpent...',
    'Se på klokka, det er jo snart helg!',
    'Nei... Må fokusere...',
    'Nesten ferdig...',
]

export function NySykmeldingOpprettProgressModal({ isPending }: { isPending: boolean }): ReactElement {
    const [loadingMessage, setLoadingMessage] = useState(0)

    useInterval(() => {
        setLoadingMessage((prev) => (prev + 1) % funnyLoadingMessagesNorwegian.length)
    }, 3500)

    return (
        <Modal header={{ heading: 'Oppretter sykmelding...', closeButton: false }} open={isPending} onClose={void 0}>
            <Modal.Body className="min-h-40 min-w-96 flex flex-col justify-center items-center">
                <BodyShort size="large" spacing className="text-text-subtle">
                    {funnyLoadingMessagesNorwegian[loadingMessage]}
                </BodyShort>
                <div className={styles.loader}></div>
            </Modal.Body>
        </Modal>
    )
}
