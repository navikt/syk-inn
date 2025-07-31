import React, { ReactElement } from 'react'

import { SykmeldingFragment } from '@queries'
import AkselNextLink from '@components/links/AkselNextLink'

import { sykmeldingPeriodeText } from './sykmelding-utils'

type Props = {
    sykmeldingId: string
    aktivitet: SykmeldingFragment['values']['aktivitet']
}

function SykmeldingPeriodeLink({ sykmeldingId, aktivitet }: Props): ReactElement {
    return (
        <>
            <AkselNextLink href={`/fhir/sykmelding/${sykmeldingId}`}>{sykmeldingPeriodeText(aktivitet)}</AkselNextLink>
        </>
    )
}

export default SykmeldingPeriodeLink
