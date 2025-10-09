import * as R from 'remeda'
import { BodyShort, Detail, List } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { SykmeldingFragment } from '@queries'
import { toReadableDate, toReadableDatePeriod } from '@lib/date'
import { ValueItem } from '@components/sykmelding/ValuesSection'
import { ArbeidsrelaterteArsaker } from '@features/ny-sykmelding-form/aktivitet/ArsakerPicker'

type Props = {
    sykmelding: SykmeldingFragment
}

function SykmeldingValues({ sykmelding }: Props): ReactElement {
    if (sykmelding.__typename === 'SykmeldingRedacted') {
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
            {sykmelding.values.aktivitet.map((it, index) => (
                <ValueItem key={index} title="Periode">
                    <BodyShort>{toReadableDatePeriod(it.fom, it.tom)}</BodyShort>
                    {it.__typename === 'AktivitetIkkeMulig' && (
                        <>
                            <BodyShort>100% sykmelding</BodyShort>
                            <ul className="list-disc pl-6">
                                {it.medisinskArsak?.isMedisinskArsak && (
                                    <li>Det er medisinske årsaker som forhindrer arbeidsrelatert aktivitet</li>
                                )}
                                {it.arbeidsrelatertArsak?.isArbeidsrelatertArsak && (
                                    <li>
                                        Det er arbeidsrelaterte årsaker som forhindrer arbeidsrelatert aktivitet
                                        <ul className="list-disc pl-6">
                                            {it.arbeidsrelatertArsak?.arbeidsrelaterteArsaker.map(
                                                (arsak, arsakIndex) => (
                                                    <li key={arsakIndex}>
                                                        {ArbeidsrelaterteArsaker[arsak]}
                                                        {arsak === 'ANNET' && (
                                                            <ul className="list-disc pl-6">
                                                                <li>
                                                                    {it.arbeidsrelatertArsak?.annenArbeidsrelatertArsak}
                                                                </li>
                                                            </ul>
                                                        )}
                                                    </li>
                                                ),
                                            )}
                                        </ul>
                                    </li>
                                )}
                            </ul>
                        </>
                    )}
                    {it.__typename === 'Gradert' && <BodyShort>{it.grad}% gradert sykmelding</BodyShort>}
                </ValueItem>
            ))}
            <ValueItem title="Har pasienten flere arbeidsforhold?">
                {sykmelding.values.arbeidsgiver?.harFlere ? 'Ja' : 'Nei'}
            </ValueItem>
            {sykmelding.values.arbeidsgiver?.harFlere && (
                <ValueItem title="Hvilke arbeidsforhold skal pasienten sykmeldes fra?">
                    {sykmelding.values.arbeidsgiver.arbeidsgivernavn}
                </ValueItem>
            )}
            {sykmelding.values.tilbakedatering && (
                <>
                    <ValueItem title="Dato for tilbakedatering">
                        {toReadableDate(sykmelding.values.tilbakedatering.startdato)}
                    </ValueItem>
                    <ValueItem title="Grunn for tilbakedatering">
                        {sykmelding.values.tilbakedatering.begrunnelse}
                    </ValueItem>
                </>
            )}

            <ValueItem title="Hoveddiagnose">
                <BodyShort>
                    {sykmelding.values.hoveddiagnose?.text} ({sykmelding.values.hoveddiagnose?.code})
                </BodyShort>
                <Detail>{sykmelding.values.hoveddiagnose?.system}</Detail>
            </ValueItem>
            {sykmelding.values.bidiagnoser && sykmelding.values.bidiagnoser.length > 0 && (
                <ValueItem title="Bidiagnoser">
                    <ul className="list-disc pl-6">
                        {sykmelding.values.bidiagnoser?.map((bidiagnose, index) => (
                            <li key={index}>
                                <BodyShort>
                                    {bidiagnose.text} ({bidiagnose.code})
                                </BodyShort>
                                <Detail>{bidiagnose.system}</Detail>
                            </li>
                        ))}
                    </ul>
                </ValueItem>
            )}
            {sykmelding.values.utdypendeSporsmal?.utfodringerMedArbeid && (
                <ValueItem title="Hvilke utfordringer har pasienten med å utføre gradert arbeid?">
                    {sykmelding.values.utdypendeSporsmal?.utfodringerMedArbeid}
                </ValueItem>
            )}
            {sykmelding.values.utdypendeSporsmal?.medisinskOppsummering && (
                <ValueItem title="Gi en kort medisinsk oppsummering av tilstanden (sykehistorie, hovedsymptomer, pågående/planlagt behandling)">
                    {sykmelding.values.utdypendeSporsmal?.medisinskOppsummering}
                </ValueItem>
            )}
            {sykmelding.values.utdypendeSporsmal?.hensynPaArbeidsplassen && (
                <ValueItem title="Hvilke hensyn må være på plass for at pasienten kan prøves i det nåværende arbeidet? (ikke obligatorisk)">
                    {sykmelding.values.utdypendeSporsmal?.hensynPaArbeidsplassen}
                </ValueItem>
            )}
            {sykmelding.values.yrkesskade?.yrkesskade && (
                <ValueItem title="Yrkesskade">
                    <BodyShort>Kan skyldes yrkesskade? Ja</BodyShort>
                    {sykmelding.values.yrkesskade?.skadedato && (
                        <BodyShort>
                            Dato for yrkesskade: {toReadableDate(sykmelding.values.yrkesskade?.skadedato)}
                        </BodyShort>
                    )}
                </ValueItem>
            )}
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
