import React, { ReactElement } from 'react'
import { InfoCard } from '@navikt/ds-react'
import { CheckmarkCircleFillIcon } from '@navikt/aksel-icons'

export function DocumentStatusSuccess(): ReactElement {
    return (
        <InfoCard data-color="info" size="small">
            <InfoCard.Header icon={<CheckmarkCircleFillIcon aria-hidden />}>
                <InfoCard.Title>Sykmeldingdokument er lagret i EPJ-systemet</InfoCard.Title>
            </InfoCard.Header>
        </InfoCard>
    )
}
