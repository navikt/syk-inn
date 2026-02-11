import {
    AktivitetType,
    DocumentStatus,
    InputAktivitet,
    InputMaybe,
    InputUtdypendeSporsmal,
    OpprettSykmeldingInput,
    SykmeldingFull,
    SykmeldingLight,
    SykmeldingRedacted,
} from '@resolvers'
import {
    OpprettSykmeldingAktivitet,
    OpprettSykmeldingMeta,
    OpprettSykmeldingPayload,
} from '@core/services/syk-inn-api/schema/opprett'
import { SykInnApiSykmelding, SykInnApiSykmeldingRedacted } from '@core/services/syk-inn-api/schema/sykmelding'
import { byCurrentOrPreviousWithOffset } from '@data-layer/common/sykmelding-utils'
import { AnnenFravarsgrunnArsak } from '@queries'
import { questionTexts } from '@data-layer/common/questions'

export function sykInnApiSykmeldingRedactedToResolverSykmelding(
    sykmelding: SykInnApiSykmeldingRedacted,
): SykmeldingRedacted {
    return {
        kind: 'redacted',
        sykmeldingId: sykmelding.sykmeldingId,
        meta: {
            pasientIdent: sykmelding.meta.pasientIdent,
            legekontorOrgnr: sykmelding.meta.legekontorOrgnr,
            mottatt: sykmelding.meta.mottatt,
            sykmelderHpr: sykmelding.meta.sykmelder.hprNummer,
        },
        values: {
            aktivitet: sykmelding.values.aktivitet.map((it) => ({
                ...it,
                type: it.type as AktivitetType,
            })),
        },
        utfall: sykmelding.utfall,
    }
}

export function sykInnApiSykmeldingToResolverSykmelding(
    sykmelding: SykInnApiSykmelding,
    documentStatus?: DocumentStatus,
): SykmeldingFull | SykmeldingLight {
    const isWithinOffset = byCurrentOrPreviousWithOffset(sykmelding)

    /**
     * If the sykmelding is outside of offset, return a light version.
     */
    if (!isWithinOffset) {
        return {
            kind: 'light',
            sykmeldingId: sykmelding.sykmeldingId,
            meta: {
                pasientIdent: sykmelding.meta.pasientIdent,
                legekontorOrgnr: sykmelding.meta.legekontorOrgnr,
                mottatt: sykmelding.meta.mottatt,
                sykmelderHpr: sykmelding.meta.sykmelder.hprNummer,
            },
            values: {
                aktivitet: sykmelding.values.aktivitet,
                hoveddiagnose: sykmelding.values.hoveddiagnose,
                bidiagnoser: sykmelding.values.bidiagnoser,
            },
            utfall: sykmelding.utfall,
            documentStatus: documentStatus ?? null,
        } satisfies SykmeldingLight
    }

    return sykInnApiSykmeldingToResolverSykmeldingFull(sykmelding, documentStatus)
}

export function sykInnApiSykmeldingToResolverSykmeldingFull(
    sykmelding: SykInnApiSykmelding,
    documentStatus?: DocumentStatus,
): SykmeldingFull {
    return {
        kind: 'full',
        sykmeldingId: sykmelding.sykmeldingId,
        meta: {
            pasientIdent: sykmelding.meta.pasientIdent,
            legekontorOrgnr: sykmelding.meta.legekontorOrgnr,
            mottatt: sykmelding.meta.mottatt,
            sykmelderHpr: sykmelding.meta.sykmelder.hprNummer,
        },
        values: {
            aktivitet: sykmelding.values.aktivitet,
            hoveddiagnose: sykmelding.values.hoveddiagnose,
            bidiagnoser: sykmelding.values.bidiagnoser,
            svangerskapsrelatert: sykmelding.values.svangerskapsrelatert,
            pasientenSkalSkjermes: sykmelding.values.pasientenSkalSkjermes,
            meldinger: sykmelding.values.meldinger,
            yrkesskade: sykmelding.values.yrkesskade,
            arbeidsgiver: sykmelding.values.arbeidsgiver,
            tilbakedatering: sykmelding.values.tilbakedatering,
            utdypendeSporsmalSvar: sykmelding.values.utdypendeSporsmalSvar,
            annenFravarsgrunn: sykmelding.values.annenFravarsgrunn as AnnenFravarsgrunnArsak,
        },
        utfall: sykmelding.utfall,
        documentStatus: documentStatus ?? null,
    }
}

export function resolverInputToSykInnApiPayload(
    draftId: string,
    values: OpprettSykmeldingInput,
    meta: OpprettSykmeldingMeta,
): OpprettSykmeldingPayload {
    return {
        submitId: draftId,
        meta,
        values: {
            pasientenSkalSkjermes: values.pasientenSkalSkjermes,
            hoveddiagnose: values.hoveddiagnose,
            bidiagnoser: values.bidiagnoser,
            aktivitet: values.aktivitet.map(uglyGqlToSykInnAktivitet),
            meldinger: {
                tilNav: values.meldinger.tilNav ?? null,
                tilArbeidsgiver: values.meldinger.tilArbeidsgiver ?? null,
            },
            svangerskapsrelatert: values.svangerskapsrelatert,
            yrkesskade: values.yrkesskade?.yrkesskade
                ? {
                      yrkesskade: true,
                      skadedato: values.yrkesskade.skadedato ?? null,
                  }
                : null,
            arbeidsgiver: values.arbeidsforhold
                ? {
                      harFlere: true,
                      arbeidsgivernavn: values.arbeidsforhold.arbeidsgivernavn,
                  }
                : null,
            tilbakedatering: values.tilbakedatering
                ? {
                      begrunnelse: values.tilbakedatering.begrunnelse,
                      startdato: values.tilbakedatering.startdato,
                  }
                : null,
            utdypendeSporsmalAnswerOptions: mapUtdypendeSporsmalToSykInnApiMap(values.utdypendeSporsmal),
            annenFravarsgrunn: values.annenFravarsgrunn ?? null,
        },
    }
}

function mapUtdypendeSporsmalToSykInnApiMap(
    utdypendeSporsmal?: InputMaybe<InputUtdypendeSporsmal> | undefined,
): OpprettSykmeldingPayload['values']['utdypendeSporsmalAnswerOptions'] {
    const result: OpprettSykmeldingPayload['values']['utdypendeSporsmalAnswerOptions'] = {
        utfordringerMedArbeid: null,
        medisinskOppsummering: null,
        hensynPaArbeidsplassen: null,
    }

    if (!utdypendeSporsmal) {
        return result
    }

    // Explicitly map known fields to ensure type safety
    if (utdypendeSporsmal.utfordringerMedArbeid != null) {
        result.utfordringerMedArbeid = {
            sporsmalstekst: questionTexts.utdypdendeSporsmal.utfordringerMedArbeid.label,
            svar: utdypendeSporsmal.utfordringerMedArbeid,
        }
    }
    if (utdypendeSporsmal.medisinskOppsummering != null) {
        result.medisinskOppsummering = {
            sporsmalstekst: questionTexts.utdypdendeSporsmal.medisinskOppsummering.label,
            svar: utdypendeSporsmal.medisinskOppsummering,
        }
    }
    if (utdypendeSporsmal.hensynPaArbeidsplassen != null) {
        result.hensynPaArbeidsplassen = {
            sporsmalstekst: questionTexts.utdypdendeSporsmal.hensynPaArbeidsplassen.label,
            svar: utdypendeSporsmal.hensynPaArbeidsplassen,
        }
    }

    return result
}

/**
 * Ugly because: https://github.com/graphql/graphql-wg/blob/main/rfcs/InputUnion.md
 */
function uglyGqlToSykInnAktivitet(aktivitet: InputAktivitet): OpprettSykmeldingAktivitet {
    if (aktivitet.aktivitetIkkeMulig != null) {
        return {
            type: 'AKTIVITET_IKKE_MULIG',
            fom: aktivitet.fom,
            tom: aktivitet.tom,
            medisinskArsak: {
                isMedisinskArsak: aktivitet.aktivitetIkkeMulig.medisinskArsak?.isMedisinskArsak ?? false,
            },
            arbeidsrelatertArsak: {
                isArbeidsrelatertArsak:
                    aktivitet.aktivitetIkkeMulig.arbeidsrelatertArsak?.isArbeidsrelatertArsak ?? false,
                arbeidsrelaterteArsaker:
                    aktivitet.aktivitetIkkeMulig.arbeidsrelatertArsak?.arbeidsrelaterteArsaker.map((it) => {
                        switch (it) {
                            case 'TILRETTELEGGING_IKKE_MULIG':
                            case 'ANNET':
                                return it
                            default:
                                throw new Error(`Unknown arbeidsrelatertArsak: ${it}`)
                        }
                    }) ?? [],
                annenArbeidsrelatertArsak:
                    aktivitet.aktivitetIkkeMulig.arbeidsrelatertArsak?.annenArbeidsrelatertArsak ?? null,
            },
        }
    } else if (aktivitet.gradert != null) {
        return {
            type: 'GRADERT',
            fom: aktivitet.fom,
            tom: aktivitet.tom,
            grad: aktivitet.gradert.grad,
            reisetilskudd: aktivitet.gradert.reisetilskudd,
        }
    } else if (aktivitet.avventende) {
        return {
            type: 'AVVENTENDE',
            fom: aktivitet.fom,
            tom: aktivitet.tom,
            innspillTilArbeidsgiver: aktivitet.avventende?.innspillTilArbeidsgiver,
        }
    } else if (aktivitet.behandlingsdager) {
        return {
            type: 'BEHANDLINGSDAGER',
            fom: aktivitet.fom,
            tom: aktivitet.tom,
            antallBehandlingsdager: aktivitet.behandlingsdager.antallBehandlingsdager,
        }
    } else if (aktivitet.reisetilskudd) {
        return {
            type: 'REISETILSKUDD',
            fom: aktivitet.fom,
            tom: aktivitet.tom,
        }
    }

    throw new Error(`Unknown activity type`)
}
