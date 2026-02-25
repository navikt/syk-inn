import { formatISO } from 'date-fns'
import * as R from 'remeda'

import { RuleResult, SykInnApiAktivitet, SykInnApiSykmelding } from '@core/services/syk-inn-api/schema/sykmelding'
import { OpprettSykmeldingPayload } from '@core/services/syk-inn-api/schema/opprett'

import { addDiagnoseText } from './diagnose'

export function sykInnApiPayloadToResponse(
    sykmeldingId: string,
    utfall: RuleResult,
    payload: OpprettSykmeldingPayload,
): SykInnApiSykmelding {
    return {
        kind: 'full',
        sykmeldingId,
        meta: {
            pasientIdent: payload.meta.pasientIdent,
            sykmelder: {
                hprNummer: payload.meta.sykmelderHpr,
                fornavn: 'Koman',
                mellomnavn: null,
                etternavn: 'Magnar',
            },
            legekontorOrgnr: payload.meta.legekontorOrgnr,
            legekontorTlf: payload.meta.legekontorTlf ?? null,
            mottatt: formatISO(new Date()),
        },
        values: {
            hoveddiagnose: addDiagnoseText(payload.values.hoveddiagnose),
            bidiagnoser: payload.values.bidiagnoser.map(addDiagnoseText).filter(R.isNonNull),
            aktivitet: payload.values.aktivitet.map((it): SykInnApiAktivitet => {
                switch (it.type) {
                    case 'AKTIVITET_IKKE_MULIG':
                        return {
                            type: 'AKTIVITET_IKKE_MULIG',
                            fom: it.fom,
                            tom: it.tom,
                            medisinskArsak: it.medisinskArsak,
                            arbeidsrelatertArsak: it.arbeidsrelatertArsak,
                        }
                    case 'GRADERT':
                        return {
                            type: 'GRADERT',
                            fom: it.fom,
                            tom: it.tom,
                            grad: it.grad,
                            reisetilskudd: it.reisetilskudd,
                        }
                    case 'REISETILSKUDD':
                        return {
                            type: 'REISETILSKUDD',
                            fom: it.fom,
                            tom: it.tom,
                        }
                    case 'AVVENTENDE':
                        return {
                            type: 'AVVENTENDE',
                            fom: it.fom,
                            tom: it.tom,
                            innspillTilArbeidsgiver: it.innspillTilArbeidsgiver,
                        }
                    case 'BEHANDLINGSDAGER':
                        return {
                            type: 'BEHANDLINGSDAGER',
                            fom: it.fom,
                            tom: it.tom,
                            antallBehandlingsdager: it.antallBehandlingsdager,
                        }
                }
            }),
            svangerskapsrelatert: payload.values.svangerskapsrelatert,
            pasientenSkalSkjermes: payload.values.pasientenSkalSkjermes,
            meldinger: {
                tilNav: payload.values.meldinger.tilNav,
                tilArbeidsgiver: payload.values.meldinger.tilArbeidsgiver,
            },
            yrkesskade: payload.values.yrkesskade ?? null,
            arbeidsgiver: payload.values.arbeidsgiver
                ? {
                      harFlere: true,
                      arbeidsgivernavn: payload.values.arbeidsgiver.arbeidsgivernavn,
                  }
                : null,
            tilbakedatering: payload.values.tilbakedatering ?? null,
            utdypendeSporsmal: null,
            utdypendeSporsmalSvar: payload.values.utdypendeSporsmalAnswerOptions
                ? {
                      utfordringerMedArbeid:
                          payload.values.utdypendeSporsmalAnswerOptions.utfordringerMedArbeid ?? null,
                      medisinskOppsummering:
                          payload.values.utdypendeSporsmalAnswerOptions.medisinskOppsummering ?? null,
                      hensynPaArbeidsplassen:
                          payload.values.utdypendeSporsmalAnswerOptions.hensynPaArbeidsplassen ?? null,
                      sykdomsutvikling: payload.values.utdypendeSporsmalAnswerOptions.sykdomsutvikling ?? null,
                      arbeidsrelaterteUtfordringer:
                          payload.values.utdypendeSporsmalAnswerOptions.arbeidsrelaterteUtfordringer ?? null,
                      behandlingOgFremtidigArbeidArbeid:
                          payload.values.utdypendeSporsmalAnswerOptions.behandlingOgFremtidigArbeidArbeid ?? null,
                      uavklarteForhold: payload.values.utdypendeSporsmalAnswerOptions.uavklarteForhold ?? null,
                      oppdatertMedisinskStatus:
                          payload.values.utdypendeSporsmalAnswerOptions.oppdatertMedisinskStatus ?? null,
                      realistiskMestringArbeid:
                          payload.values.utdypendeSporsmalAnswerOptions.realistiskMestringArbeid ?? null,
                      forventetHelsetilstandUtvikling:
                          payload.values.utdypendeSporsmalAnswerOptions.forventetHelsetilstandUtvikling ?? null,
                      medisinskeHensyn: payload.values.utdypendeSporsmalAnswerOptions.medisinskeHensyn ?? null,
                  }
                : null,
            annenFravarsgrunn: payload.values.annenFravarsgrunn,
        },
        utfall: utfall,
    }
}
