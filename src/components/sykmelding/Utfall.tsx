import React from 'react'
import { BodyShort } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'

import { SykmeldingFragment } from '@queries'

export function Utfall({
    utfall,
    size = 'small',
}: {
    utfall: SykmeldingFragment['utfall']
    size?: 'small' | 'medium'
}): React.ReactElement | null {
    if (utfall.result === 'OK') {
        return <BodyShort size={size}>Godkjent</BodyShort>
    } else if (utfall.result === 'PENDING') {
        return <BodyShort size={size}>Til behandling</BodyShort>
    } else if (utfall.result === 'INVALID') {
        return <BodyShort size={size}>Avvist</BodyShort>
    }

    logger.error(`Unknown utfall for sykmelding: ${utfall.result}`)

    return null
}
