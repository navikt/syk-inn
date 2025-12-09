import React, { ReactElement } from 'react'

import { SykmeldingFragment } from '@queries'
import { AkselNextLink } from '@components/links/AkselNextLink'
import { useMode } from '@core/providers/Modes'

import { sykmeldingPeriodeText } from './sykmelding-utils'

type Props = {
    sykmeldingId: string
    aktivitet: SykmeldingFragment['values']['aktivitet']
}

function SykmeldingPeriodeLink({ sykmeldingId, aktivitet }: Props): ReactElement {
    const mode = useMode()

    return (
        <AkselNextLink href={mode.paths.sykmelding(sykmeldingId)} prefetch={false}>
            {sykmeldingPeriodeText(aktivitet)}
        </AkselNextLink>
    )
}

export default SykmeldingPeriodeLink
