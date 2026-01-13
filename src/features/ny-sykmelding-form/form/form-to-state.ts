import * as R from 'remeda'

import { type AktivitetsPeriode, NySykmeldingMainFormValues } from '@features/ny-sykmelding-form/form/types'
import { NySykmeldingAktivitet, NySykmeldingFormPayload } from '@core/redux/reducers/ny-sykmelding/form'
import { raise } from '@lib/ts'
import { Diagnose } from '@data-layer/common/diagnose'

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
            values.tilbakedatering?.fom && values.tilbakedatering?.grunn
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
                medisinskArsak: {
                    isMedisinskArsak: value.medisinskArsak?.isMedisinskArsak ?? null,
                },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: value.arbeidsrelatertArsak?.isArbeidsrelatertArsak ?? false,
                    arbeidsrelaterteArsaker: value.arbeidsrelatertArsak?.arbeidsrelaterteArsaker ?? null,
                    annenArbeidsrelatertArsak: value.arbeidsrelatertArsak?.annenArbeidsrelatertArsak ?? null,
                },
            }
        case 'GRADERT':
            return {
                type: 'GRADERT',
                fom: value.periode.fom ?? raise('FOM is required for GRADERT'),
                tom: value.periode.tom ?? raise('TOM is required for GRADERT'),
                grad: R.isNumber(Number(value.aktivitet.grad))
                    ? Number(value.aktivitet.grad)
                    : raise('Grad is required for GRADERT'),
            }
    }
}
