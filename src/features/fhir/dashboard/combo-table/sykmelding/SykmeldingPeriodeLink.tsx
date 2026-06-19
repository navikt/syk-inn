import { BodyShort, HelpText } from '@navikt/ds-react'
import React, { ReactElement } from 'react'
import * as R from 'remeda'

import { AkselNextLink } from '#components/links/AkselNextLink'
import { useMode } from '#core/providers/Modes'
import { SykmeldingFragment } from '#queries'

import { aktivitetGradText, sykmeldingPeriodeText } from './sykmelding-utils'

type Props = {
    sykmeldingId: string
    aktivitet: SykmeldingFragment['values']['aktivitet']
}

function SykmeldingPeriodeLink({ sykmeldingId, aktivitet }: Props): ReactElement {
    const mode = useMode()
    const sortedPeriode = R.sortBy(aktivitet, [(it) => it.fom, 'asc'])

    return (
        <div className="flex gap-2">
            <AkselNextLink href={mode.paths.sykmelding(sykmeldingId)}>
                {sykmeldingPeriodeText(sortedPeriode)}
            </AkselNextLink>
            {sortedPeriode.length > 1 && (
                <HelpText title="Se alle perioder for sykmelding">
                    {sortedPeriode.map((periode) => (
                        <React.Fragment key={periode.fom}>
                            <BodyShort size="small" className="whitespace-nowrap">
                                {sykmeldingPeriodeText([periode])} ({aktivitetGradText(periode)})
                            </BodyShort>
                        </React.Fragment>
                    ))}
                </HelpText>
            )}
        </div>
    )
}

export default SykmeldingPeriodeLink
