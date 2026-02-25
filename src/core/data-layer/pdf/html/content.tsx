/* eslint-disable @next/next/no-head-element */

import React, { ReactElement } from 'react'

import { AnnenFravarsgrunnArsak } from '@queries'
import { PdlPerson } from '@core/services/pdl/pdl-api-schema'
import { formatPdlName } from '@core/services/pdl/pdl-api-utils'
import { SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { annenFravarsgrunnToText } from '@data-layer/common/annen-fravarsgrunn'
import { getSimpleSykmeldingDescription } from '@data-layer/common/sykmelding-utils'
import { Diagnose } from '@data-layer/common/diagnose'
import { toReadableDate } from '@lib/date'

import { toHTML } from './render'
import { AktivitetItems } from './components/AktivitetItems'
import { ValueItem } from './components/ValueItem'
import { contentCss } from './styles/content.css'
import { resetCss } from './styles/reset.css'

export async function createBodyHtml(sykmelding: SykInnApiSykmelding, person: PdlPerson): Promise<string> {
    const html = await toHTML(
        <html lang="nb">
            <head>
                <meta charSet="utf-8" />
                <title>{`Sykmelding - ${getSimpleSykmeldingDescription(sykmelding.values.aktivitet)}`}</title>
                <style>{resetCss}</style>
                <style>{contentCss}</style>
            </head>
            <body>
                <SykmeldingValues sykmelding={sykmelding} person={person} />
            </body>
        </html>,
    )

    return '<!DOCTYPE html>\n' + html
}

function SykmeldingValues({
    sykmelding,
    person,
}: {
    sykmelding: SykInnApiSykmelding
    person: PdlPerson
}): ReactElement {
    return (
        <div className="value-container">
            <ValueItem label="Navn" value={`${formatPdlName(person.navn)} (${sykmelding.meta.pasientIdent})`} />
            <ValueItem label="Mottatt av Nav" value={toReadableDate(sykmelding.meta.mottatt)} />
            <SykmelderItem sykmelder={sykmelding.meta.sykmelder} />
            <LegekontorItem meta={sykmelding.meta} />
            {sykmelding.values.arbeidsgiver?.harFlere && (
                <ValueItem label="Arbeidsgiver" value={sykmelding.values.arbeidsgiver.arbeidsgivernavn} />
            )}

            <AktivitetItems aktivitet={sykmelding.values.aktivitet} />

            <ValueItem
                label="Diagnose"
                value={
                    sykmelding.values.hoveddiagnose
                        ? formatDiagnose(sykmelding.values.hoveddiagnose)
                        : 'Ingen diagnose oppgitt'
                }
                full={sykmelding.values.bidiagnoser == null || sykmelding.values.bidiagnoser.length === 0}
            />

            {sykmelding.values.bidiagnoser && sykmelding.values.bidiagnoser.length > 0 && (
                <ValueItem label="Bidiagnoser" value={sykmelding.values.bidiagnoser.map((it) => formatDiagnose(it))} />
            )}

            {sykmelding.values.annenFravarsgrunn && (
                <ValueItem
                    label="Annen lovfestet fraværsgrunn"
                    value={annenFravarsgrunnToText(sykmelding.values.annenFravarsgrunn as AnnenFravarsgrunnArsak)}
                    full
                />
            )}

            {Object.values(sykmelding.values.utdypendeSporsmalSvar ?? {})
                .filter((it) => it != null)
                .map((it) => (
                    <ValueItem key={it?.sporsmalstekst} label={it?.sporsmalstekst ?? ''} value={it.svar} full />
                ))}

            {(sykmelding.values.svangerskapsrelatert || sykmelding.values.yrkesskade?.yrkesskade) && (
                <AndresporsmalItem values={sykmelding.values} />
            )}

            <ValueItem
                label="Melding til Nav"
                value={sykmelding.values.meldinger.tilNav ?? 'Ingen melding til Nav'}
                italic={sykmelding.values.meldinger.tilNav == null}
                full
            />

            <ValueItem
                label="Innspill til arbeidsgiver"
                value={sykmelding.values.meldinger.tilArbeidsgiver ?? 'Ingen melding til arbeidsgiver'}
                italic={sykmelding.values.meldinger.tilArbeidsgiver == null}
                full
            />

            {sykmelding.values.pasientenSkalSkjermes && (
                <ValueItem label="Pasienten er skjermet for medisinske opplysninger" value="Ja" full />
            )}
        </div>
    )
}

function SykmelderItem({ sykmelder }: { sykmelder: SykInnApiSykmelding['meta']['sykmelder'] }): ReactElement {
    const name = [sykmelder.fornavn, sykmelder.mellomnavn, sykmelder.etternavn].filter(Boolean).join(' ')

    return <ValueItem label="Sykmelder" value={[name, `HPR-nr: ${sykmelder.hprNummer}`]} />
}

function LegekontorItem({ meta }: { meta: SykInnApiSykmelding['meta'] }): ReactElement {
    return (
        <ValueItem
            label="Legekontor"
            value={[
                `Org.nr.: ${meta.legekontorOrgnr ?? 'Ikke oppgitt'}`,
                `Tlf: ${meta.legekontorTlf ?? 'Ikke oppgitt'}`,
            ]}
        />
    )
}

/**
 * Assumes at least one of the values is present, entire component is skipped otherwise by parent
 */
function AndresporsmalItem({ values }: { values: SykInnApiSykmelding['values'] }): ReactElement {
    return (
        <ValueItem label="Andre spørsmål" full>
            <dt>
                <ul>
                    {values.svangerskapsrelatert && <li>Sykdommen er svangerskapsrelatert</li>}
                    {values.yrkesskade?.yrkesskade && (
                        <li>
                            Sykmeldingen kan skyldes en yrkesskade/yrkessykdom
                            {values.yrkesskade.skadedato && (
                                <ul>
                                    <li>Dato for yrkesskade: {toReadableDate(values.yrkesskade.skadedato)}</li>
                                </ul>
                            )}
                        </li>
                    )}
                </ul>
            </dt>
        </ValueItem>
    )
}

function formatDiagnose(diagnose: Diagnose): string {
    return `${diagnose.code}: ${diagnose.text} (${diagnose.system})`
}
