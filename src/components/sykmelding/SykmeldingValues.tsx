import * as R from 'remeda'
import { BodyShort, List } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { SykmeldingFragment } from '@queries'
import { toReadableDatePeriod } from '@lib/date'
import { ValueItem } from '@components/sykmelding/ValuesSection'

type Props = {
    sykmelding: SykmeldingFragment
}

function SykmeldingValues({ sykmelding }: Props): ReactElement {
    if (sykmelding.__typename === 'SykmeldingLight') {
        return (
            <>
                <ValueItem title="Perioder (f.o.m. - t.o.m.)">
                    {sykmelding.values.aktivitet.map((it, index) => (
                        <BodyShort key={index}>{toReadableDatePeriod(it.fom, it.tom)}</BodyShort>
                    ))}
                </ValueItem>
            </>
        )
    }

    return (
        <>
            <ValueItem title="Arbeidsforhold">
                {sykmelding.values.arbeidsgiver?.arbeidsgivernavn ?? 'Ingen arbeidsgiver oppgitt'}
            </ValueItem>
            <ValueItem title="Perioder (f.o.m. - t.o.m.)">
                {sykmelding.values.aktivitet.map((it, index) => (
                    <BodyShort key={index}>{toReadableDatePeriod(it.fom, it.tom)}</BodyShort>
                ))}
            </ValueItem>
            <ValueItem title="Medisinsk tilstand">
                {sykmelding.values.hoveddiagnose?.text ?? 'Ingen hoveddiagnose oppgitt'}
            </ValueItem>
            {[sykmelding.values.svangerskapsrelatert, sykmelding.values.pasientenSkalSkjermes].some(R.isTruthy) && (
                <ValueItem title="Annen info">
                    <List>
                        {sykmelding.values.svangerskapsrelatert && (
                            <List.Item>Sykdommen er svangerskapsrelatert</List.Item>
                        )}
                        {sykmelding.values.pasientenSkalSkjermes && (
                            <List.Item>Pasienten skal skjermes for medisinsk informasjon</List.Item>
                        )}
                    </List>
                </ValueItem>
            )}
            {sykmelding.values.meldinger.tilNav && (
                <ValueItem title="Meldinger til Nav">{sykmelding.values.meldinger.tilNav}</ValueItem>
            )}
            {sykmelding.values.meldinger.tilArbeidsgiver && (
                <ValueItem title="Meldinger til arbeidsgiver">{sykmelding.values.meldinger.tilArbeidsgiver}</ValueItem>
            )}
        </>
    )
}

export default SykmeldingValues
