import React, { ReactElement } from 'react'

import {
    SykInnApiAktivitet,
    SykInnApiAktivitetGradert,
    SykInnApiAktivitetIkkeMulig,
} from '@core/services/syk-inn-api/schema/sykmelding'
import { toReadableDatePeriod } from '@lib/date'
import { raise } from '@lib/ts'

import { ValueItem, ValueSection } from './ValueItem'

export function AktivitetItems({ aktivitet }: { aktivitet: SykInnApiAktivitet[] }): ReactElement {
    if (aktivitet.length === 1) {
        const onlyAktivitet = aktivitet[0]

        return <AktivitetItem label="Sykmeldingsperiode" aktivitet={onlyAktivitet} />
    }

    return (
        <ValueSection id="sykmeldingsperioder" title="Sykmeldingsperioder">
            {aktivitet.map((periode, index) => (
                <AktivitetItem
                    key={`periode-${toReadableDatePeriod(periode.fom, periode.tom)}`}
                    label={`Periode ${index + 1}`}
                    aktivitet={periode}
                />
            ))}
        </ValueSection>
    )
}

function AktivitetItem({ label, aktivitet }: { label: string; aktivitet: SykInnApiAktivitet }): ReactElement {
    switch (aktivitet.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return <AktivitetIkkeMuligItem label={label} aktivitet={aktivitet} />
        case 'GRADERT':
            return <GradertPeriodeItem label={label} aktivitet={aktivitet} />
        case 'REISETILSKUDD':
        case 'BEHANDLINGSDAGER':
        case 'AVVENTENDE':
            raise(`Not implemented yet (${aktivitet.type})`)
    }
}

function AktivitetIkkeMuligItem({
    label,
    aktivitet,
}: {
    label: string
    aktivitet: SykInnApiAktivitetIkkeMulig
}): ReactElement {
    const { medisinskArsak, arbeidsrelatertArsak } = aktivitet
    const hasChildren = medisinskArsak?.isMedisinskArsak || arbeidsrelatertArsak?.isArbeidsrelatertArsak

    return (
        <ValueItem
            label={label}
            value={`100% sykmelding, fra ${toReadableDatePeriod(aktivitet.fom, aktivitet.tom)}`}
            full
        >
            {hasChildren && (
                <dt>
                    <ul>
                        {medisinskArsak?.isMedisinskArsak && (
                            <li>Medisinske årsaker som forhindrer arbeidsrelatert aktivitet</li>
                        )}
                        {arbeidsrelatertArsak?.isArbeidsrelatertArsak && (
                            <li>
                                Arbeidsrelaterte årsaker som forhindrer arbeidsrelatert aktivitet
                                <ul>
                                    {arbeidsrelatertArsak.arbeidsrelaterteArsaker.map((arsak) => (
                                        <li key={arsak}>
                                            {arsak === 'TILRETTELEGGING_IKKE_MULIG' && 'Tilrettelegging er ikke mulig'}
                                            {arsak === 'ANNET' &&
                                                `Annen arbeidsrelatert årsak: ${
                                                    arbeidsrelatertArsak?.annenArbeidsrelatertArsak ?? 'Ikke oppgitt'
                                                }`}
                                        </li>
                                    ))}
                                </ul>
                            </li>
                        )}
                    </ul>
                </dt>
            )}
        </ValueItem>
    )
}

function GradertPeriodeItem({
    label,
    aktivitet,
}: {
    label: string
    aktivitet: SykInnApiAktivitetGradert
}): ReactElement {
    return (
        <ValueItem
            label={label}
            value={`${aktivitet.grad.toFixed(0)}% gradert sykmelding, fra ${toReadableDatePeriod(aktivitet.fom, aktivitet.tom)}`}
            full
        />
    )
}
