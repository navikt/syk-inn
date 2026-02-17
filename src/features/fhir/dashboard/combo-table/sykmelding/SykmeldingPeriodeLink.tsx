import * as R from 'remeda'
import React, { ReactElement } from 'react'
import { BodyShort, VStack } from '@navikt/ds-react'

import { SykmeldingFragment } from '@queries'
import { AkselNextLink } from '@components/links/AkselNextLink'
import { useMode } from '@core/providers/Modes'

import { aktivitetGradText, sykmeldingPeriodeText } from './sykmelding-utils'

type Props = {
    sykmeldingId: string
    aktivitet: SykmeldingFragment['values']['aktivitet']
}

function SykmeldingPeriodeLink({ sykmeldingId, aktivitet }: Props): ReactElement {
    const mode = useMode()
    const sortedPeriode = R.sortBy(aktivitet, [(it) => it.fom, 'asc'])

    return (
        <VStack gap="space-4">
            <AkselNextLink href={mode.paths.sykmelding(sykmeldingId)}>
                {sykmeldingPeriodeText(sortedPeriode)}
            </AkselNextLink>
            {sortedPeriode.length > 1 &&
                sortedPeriode.map((periode) => (
                    <React.Fragment key={periode.fom}>
                        <BodyShort size="small" className="whitespace-nowrap">
                            · {sykmeldingPeriodeText([periode])} ({aktivitetGradText(periode)})
                        </BodyShort>
                    </React.Fragment>
                ))}
        </VStack>
    )
}

export default SykmeldingPeriodeLink
