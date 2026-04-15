import * as R from 'remeda'

import type { SykInnApiAktivitet, SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { spanServerAsync } from '@lib/otel/server'
import { PdlPerson } from '@core/services/pdl/pdl-api-schema'
import { toReadableDate, toReadableDatePeriod } from '@lib/date'
import { PdfResult, TypstPdfSykmelding } from '@core/pdf/types'
import { execTypst } from '@core/pdf/typst'
import { getSimpleSykmeldingDescription } from '@data-layer/common/sykmelding-utils'

export async function createTypstSykmelding(sykmelding: SykInnApiSykmelding, person: PdlPerson): Promise<PdfResult> {
    return spanServerAsync('pdf-service.createTypstSykmelding', async () => {
        const payload: TypstPdfSykmelding = mapSykInnToPdfPayload(sykmelding, person)

        return await execTypst({
            module: 'sykmelding.typ',
            payload: payload,
        })
    })
}

export function mapSykInnToPdfPayload(sykmelding: SykInnApiSykmelding, person: PdlPerson): TypstPdfSykmelding {
    // TODO: This will be better in Ktor rewrite
    const sykmelderNavn = [
        sykmelding.meta.sykmelder.fornavn,
        sykmelding.meta.sykmelder.mellomnavn,
        sykmelding.meta.sykmelder.etternavn,
    ]
        .filter(R.isNonNull)
        .join(' ')

    // TODO: This will be better in Ktor rewrite
    const pasientNavn = [person.navn.fornavn, person.navn.mellomnavn, person.navn.etternavn]
        .filter(R.isNonNull)
        .join(' ')

    return {
        id: sykmelding.sykmeldingId,
        title: 'Innsendt sykmelding',
        author: `${sykmelderNavn} (${sykmelding.meta.sykmelder.hprNummer})`,
        description: getSimpleSykmeldingDescription(sykmelding.values.aktivitet),
        meta: {
            mottatt: toReadableDate(sykmelding.meta.mottatt),
            behandler: {
                hpr: sykmelding.meta.sykmelder.hprNummer,
                navn: sykmelderNavn,
            },
            pasient: {
                ident: sykmelding.meta.pasientIdent,
                navn: pasientNavn,
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
            diagnose: {
                hoved: sykmelding.values.hoveddiagnose,
                bi: sykmelding.values.bidiagnoser ?? [],
            },
            aktivitet: sykmelding.values.aktivitet.map((it) => ({
                periode: toReadableDatePeriod(it.fom, it.tom),
                type: toPeriodeText(it),
                details: toPeriodeDetails(it),
            })),
            utdypendeSporsmal: sykmelding.values.utdypendeSporsmalSvar
                ? R.values(sykmelding.values.utdypendeSporsmalSvar)
                      .filter(R.isNonNull)
                      .map((it) => ({
                          text: it.sporsmalstekst ?? 'Utdypende spørsmål',
                          answer: it.svar,
                      }))
                : [],
        },
    }
}

function toPeriodeDetails(aktivitet: SykInnApiAktivitet): string[] {
    switch (aktivitet.type) {
        case 'AVVENTENDE':
        case 'BEHANDLINGSDAGER':
        case 'REISETILSKUDD':
        case 'GRADERT':
            return []
        case 'AKTIVITET_IKKE_MULIG':
            const details: string[] = []

            if (aktivitet.medisinskArsak?.isMedisinskArsak == true) {
                details.push('Medisinske årsaker forhindrer arbeidsaktivitet')
            }

            if (aktivitet.arbeidsrelatertArsak?.isArbeidsrelatertArsak == true) {
                details.push('Arbeidsrelaterte årsaker forhindrer arbeidsaktivitet')

                if (aktivitet.arbeidsrelatertArsak.arbeidsrelaterteArsaker.length > 0) {
                    details.push(
                        ...aktivitet.arbeidsrelatertArsak.arbeidsrelaterteArsaker.map((it) => {
                            switch (it) {
                                case 'TILRETTELEGGING_IKKE_MULIG':
                                    return 'Tilrettelegging ikke mulig'
                                case 'ANNET':
                                    return `Annet: ${aktivitet.arbeidsrelatertArsak?.annenArbeidsrelatertArsak ?? 'Grunn mangler'}`
                            }
                        }),
                    )
                }
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
