import * as R from 'remeda'

import { annenFravarsgrunnToText } from '@data-layer/common/annen-fravarsgrunn'
import { AnnenFravarsgrunnArsak } from '@queries'
import type { SykInnApiAktivitet, SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { spanServerAsync } from '@lib/otel/server'
import { toReadableDate, toReadableDatePeriod } from '@lib/date'
import { PdfResult, TypstPdfSykmelding } from '@core/pdf/types'
import { execTypst } from '@core/pdf/typst'
import { getSimpleSykmeldingDescription } from '@data-layer/common/sykmelding-utils'

export async function createTypstSykmelding(sykmelding: SykInnApiSykmelding): Promise<PdfResult> {
    return spanServerAsync('pdf-service.createTypstSykmelding', async () => {
        const payload: TypstPdfSykmelding = mapSykInnToPdfPayload(sykmelding)

        return await execTypst({
            module: 'sykmelding.typ',
            payload: payload,
        })
    })
}

export function mapSykInnToPdfPayload(sykmelding: SykInnApiSykmelding): TypstPdfSykmelding {
    return {
        id: sykmelding.sykmeldingId,
        title: 'Innsendt sykmelding',
        author: `${sykmelding.meta.sykmelder.navn} (${sykmelding.meta.sykmelder.hpr})`,
        description: getSimpleSykmeldingDescription(sykmelding.values.aktivitet),
        meta: {
            mottatt: toReadableDate(sykmelding.meta.mottatt),
            behandler: {
                hpr: sykmelding.meta.sykmelder.hpr,
                navn: sykmelding.meta.sykmelder.navn,
            },
            pasient: {
                ident: sykmelding.meta.pasient.ident,
                navn: sykmelding.meta.pasient.navn,
            },
            legekontor: {
                orgnr: sykmelding.meta.legekontorOrgnr,
                tlf: sykmelding.meta.legekontorTlf,
            },
        },
        values: {
            arbeidsgiver:
                sykmelding.values.arbeidsgiver?.harFlere === true
                    ? sykmelding.values.arbeidsgiver.arbeidsgivernavn
                    : null,
            annenFravarsgrunn:
                sykmelding.values.annenFravarsgrunn != null
                    ? annenFravarsgrunnToText(sykmelding.values.annenFravarsgrunn as AnnenFravarsgrunnArsak)
                    : null,
            andreSporsmal: toAndreSporsmal(sykmelding),
            meldinger: {
                tilNav: sykmelding.values.meldinger?.tilNav ?? null,
                tilArbeidsgiver: sykmelding.values.meldinger?.tilArbeidsgiver ?? null,
            },
            pasientenSkalSkjermes: sykmelding.values.pasientenSkalSkjermes,
            diagnose: {
                hoved: sykmelding.values.hoveddiagnose,
                bi: sykmelding.values.bidiagnoser ?? [],
            },
            aktivitet: sykmelding.values.aktivitet.map((it) => ({
                periode: toReadableDatePeriod(it.fom, it.tom),
                type: toPeriodeText(it),
                details: toPeriodeDetails(it),
            })),
            utdypendeSporsmal: sykmelding.values.utdypendeSporsmal
                ? R.values(sykmelding.values.utdypendeSporsmal)
                      .filter(R.isNonNull)
                      .map((it) => ({
                          text: it.sporsmalstekst ?? 'Utdypende spørsmål',
                          answer: it.svar,
                      }))
                : [],
        },
    }
}

function toPeriodeDetails(aktivitet: SykInnApiAktivitet): { text: string; items: string[] }[] {
    switch (aktivitet.type) {
        case 'AVVENTENDE':
        case 'BEHANDLINGSDAGER':
        case 'REISETILSKUDD':
        case 'GRADERT':
            return []
        case 'AKTIVITET_IKKE_MULIG':
            const details: { text: string; items: string[] }[] = []

            if (aktivitet.arbeidsrelatertArsak?.isArbeidsrelatertArsak == true) {
                details.push({
                    text: 'Arbeidsrelaterte årsaker forhindrer arbeidsaktivitet',
                    items: aktivitet.arbeidsrelatertArsak.arbeidsrelaterteArsaker.map((it) => {
                        switch (it) {
                            case 'MANGLENDE_TILRETTELEGGING':
                                return 'Tilrettelegging ikke mulig'
                            case 'ANNET':
                                return `Annet: ${aktivitet.arbeidsrelatertArsak?.annenArbeidsrelatertArsak ?? 'Grunn mangler'}`
                        }
                    }),
                })
            }

            return details
    }
}

function toPeriodeText(it: SykInnApiAktivitet): string {
    switch (it.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return '100% sykmeldt (aktivitet ikke mulig)'
        case 'GRADERT':
            return `${it.grad}% sykmeldt, gradert sykmelding`
        case 'REISETILSKUDD':
            return 'Reisetilskudd'
        case 'BEHANDLINGSDAGER':
            return `${it.antallBehandlingsdager} behandlingsdager`
        case 'AVVENTENDE':
            return 'Avventende'
    }
}

function toAndreSporsmal(sykmelding: SykInnApiSykmelding): string[] | null {
    const items: string[] = []

    if (sykmelding.values.svangerskapsrelatert) {
        items.push('Sykmeldingen er svangerskapsrelatert')
    }

    if (sykmelding.values.yrkesskade != null) {
        const skadedato =
            sykmelding.values.yrkesskade.skadedato != null
                ? `, skadedato: ${toReadableDate(sykmelding.values.yrkesskade.skadedato)}`
                : ''
        items.push(`Sykmeldingen er relatert til yrkesskade${skadedato}`)
    }

    return items.length > 0 ? items : null
}
