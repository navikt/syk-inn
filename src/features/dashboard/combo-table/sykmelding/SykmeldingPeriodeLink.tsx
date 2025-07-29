import React, { ReactElement } from 'react'
import { Link as AkselLink } from '@navikt/ds-react'
import Link from 'next/link'

import { SykmeldingFragment } from '@queries'
import { sykmeldingPeriodeText } from '@features/dashboard/combo-table/sykmelding/sykmelding-utils'

type Props = {
    sykmeldingId: string
    aktivitet: SykmeldingFragment['values']['aktivitet']
}

function SykmeldingPeriodeLink({ sykmeldingId, aktivitet }: Props): ReactElement {
    return (
        <>
            <AkselLink as={Link} href={`/fhir/sykmelding/${sykmeldingId}`}>
                {sykmeldingPeriodeText(aktivitet)}
            </AkselLink>
        </>
    )
}

export default SykmeldingPeriodeLink
