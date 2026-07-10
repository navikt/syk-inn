import React, { ReactElement } from 'react'

import { SykmeldingFragment } from '#queries'

import { ValueItem } from './ValuesSection'

type Props = {
    sykmeldingMeta: SykmeldingFragment['meta']
}

export function BehandlerValues({ sykmeldingMeta }: Props): ReactElement {
    return (
        <>
            <ValueItem title="HPR">{sykmeldingMeta.sykmelderHpr}</ValueItem>
            <ValueItem title="Organisasjonsnummer">{sykmeldingMeta.legekontorOrgnr ?? 'Ikke satt'}</ValueItem>
        </>
    )
}
