import * as R from 'remeda'

import { NySykmeldingAktivitet, NySykmeldingFormPayload } from '#core/redux/reducers/ny-sykmelding/form'
import { Diagnose } from '#data-layer/common/diagnose'
import { isTilbakedatering } from '#data-layer/common/tilbakedatering'
import { raise } from '#lib/ts'

import { type AktivitetsPeriode, NySykmeldingMainFormValues } from './types'

export function formValuesToStatePayload(values: NySykmeldingMainFormValues): NySykmeldingFormPayload {
    return {
        arbeidsforhold: {
            harFlereArbeidsforhold: jaNeiEnumToBoolean(values.arbeidsforhold.harFlereArbeidsforhold),
            sykmeldtFraArbeidsforhold: values.arbeidsforhold.sykmeldtFraArbeidsforhold,
        },
        diagnose: {
            hoved: values.diagnoser.hoved ?? raise("Can't submit step without hoveddiagnose"),
            bi: values.diagnoser.bidiagnoser.filter((it): it is Diagnose => {
                if (it == null) {
                    raise("Can't submit step with null bidiagnose")
                }
                return true
            }),
        },
        aktiviteter: values.perioder.map(formAktivitetToStepAktivitet),
        tilbakedatering:
            isTilbakedatering(values.perioder, new Date()) &&
            values.tilbakedatering?.fom &&
            values.tilbakedatering?.grunn
                ? {
                      fom: values.tilbakedatering.fom,
                      grunn: values.tilbakedatering.grunn,
                      annenGrunn: values.tilbakedatering.annenGrunn ?? null,
                  }
                : null,
        meldinger: {
            showTilNav: values.meldinger.showTilNav,
            showTilArbeidsgiver: values.meldinger.showTilArbeidsgiver,
            tilNav: values.meldinger.tilNav,
            tilArbeidsgiver: values.meldinger.tilArbeidsgiver,
        },
        andreSporsmal: {
            svangerskapsrelatert: values.andreSporsmal.svangerskapsrelatert,
            yrkesskade: values.andreSporsmal.yrkesskade?.yrkesskade ?? false,
            yrkesskadeDato: values.andreSporsmal.yrkesskade?.skadedato ?? null,
        },
        annenFravarsgrunn: {
            harFravarsgrunn: values.annenFravarsgrunn.harFravarsgrunn,
            fravarsgrunn: values.annenFravarsgrunn.fravarsgrunn,
        },
        utdypendeSporsmal: {
            utfordringerMedArbeid: values.utdypendeSporsmal?.utfordringerMedArbeid ?? null,
            medisinskOppsummering: values.utdypendeSporsmal?.medisinskOppsummering ?? null,
            hensynPaArbeidsplassen: values.utdypendeSporsmal?.hensynPaArbeidsplassen ?? null,
            sykdomsutvikling: values.utdypendeSporsmal?.sykdomsutvikling ?? null,
            arbeidsrelaterteUtfordringer: values.utdypendeSporsmal?.arbeidsrelaterteUtfordringer ?? null,
            behandlingOgFremtidigArbeid: values.utdypendeSporsmal?.behandlingOgFremtidigArbeid ?? null,
            uavklarteForhold: values.utdypendeSporsmal?.uavklarteForhold ?? null,
            oppdatertMedisinskStatus: values.utdypendeSporsmal?.oppdatertMedisinskStatus ?? null,
            realistiskMestringArbeid: values.utdypendeSporsmal?.realistiskMestringArbeid ?? null,
            forventetHelsetilstandUtvikling: values.utdypendeSporsmal?.forventetHelsetilstandUtvikling ?? null,
            medisinskeHensyn: values.utdypendeSporsmal?.medisinskeHensyn ?? null,
        },
    }
}

function jaNeiEnumToBoolean(value: 'JA' | 'NEI' | null): boolean {
    if (value === null) raise('Value cannot be null')
    return value === 'JA'
}

function formAktivitetToStepAktivitet(value: AktivitetsPeriode): NySykmeldingAktivitet {
    switch (value.aktivitet.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return {
                type: 'AKTIVITET_IKKE_MULIG',
                fom: value.periode.fom ?? raise('FOM is required for AKTIVITET_IKKE_MULIG'),
                tom: value.periode.tom ?? raise('TOM is required for AKTIVITET_IKKE_MULIG'),
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: value.aktivitet.aktivitetIkkeMulig.isArbeidsrelatertArsak,
                    arbeidsrelaterteArsaker: value.aktivitet.aktivitetIkkeMulig.arbeidsrelaterteArsaker,
                    annenArbeidsrelatertArsak: value.aktivitet.aktivitetIkkeMulig.annenArbeidsrelatertArsak,
                },
            }
        case 'GRADERT':
            return {
                type: 'GRADERT',
                fom: value.periode.fom ?? raise('FOM is required for GRADERT'),
                tom: value.periode.tom ?? raise('TOM is required for GRADERT'),
                grad: R.isNumber(Number(value.aktivitet.gradert.grad))
                    ? Number(value.aktivitet.gradert.grad)
                    : raise('Grad is required for GRADERT'),
                reisetilskudd: value.aktivitet.gradert.reisetilskudd,
            }
        case 'BEHANDLINGSDAGER':
            return {
                type: 'BEHANDLINGSDAGER',
                fom: value.periode.fom ?? raise('FOM is required for BEHANDLINGSDAGER'),
                tom: value.periode.tom ?? raise('TOM is required for BEHANDLINGSDAGER'),
            }
        case 'REISETILSKUDD':
            return {
                type: 'REISETILSKUDD',
                fom: value.periode.fom ?? raise('FOM is required for REISETILSKUDD'),
                tom: value.periode.tom ?? raise('TOM is required for REISETILSKUDD'),
            }
    }
}
