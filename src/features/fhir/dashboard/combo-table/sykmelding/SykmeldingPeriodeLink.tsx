import * as R from 'remeda'
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
    const [first, ...rest] = R.sortBy(aktivitet, [(it) => it.fom, 'desc'])

    return (
        <>
            <AkselNextLink href={mode.paths.sykmelding(sykmeldingId)}>{sykmeldingPeriodeText(first)}</AkselNextLink>
            {rest.map((periode) => (
                <div key={periode.fom}>{sykmeldingPeriodeText(periode)}</div>
            ))}
        </>
    )
}

export default SykmeldingPeriodeLink
