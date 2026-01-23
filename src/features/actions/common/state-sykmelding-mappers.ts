import { isValid, toDate } from 'date-fns'

import { booleanOrNullToJaEllerNei } from '@features/ny-sykmelding-form/form/utils'
import {
    NySykmeldingAktivitet,
    NySykmeldingAndreSporsmal,
    NySykmeldingArbeidsforhold,
    NySykmeldingMeldinger,
    NySykmeldingTilbakedatering,
} from '@core/redux/reducers/ny-sykmelding'
import { NySykmeldingMainFormValues } from '@features/ny-sykmelding-form/form/types'
import { Diagnose } from '@data-layer/common/diagnose'
import { NySykmeldingAnnenFravarsgrunn, NySykmeldingUtdypendeSporsmal } from '@core/redux/reducers/ny-sykmelding/form'

export function stateArbeidsforholdToFormValues(
    stateArbeidsforhold: NySykmeldingArbeidsforhold | null,
): NySykmeldingMainFormValues['arbeidsforhold'] | null {
    if (stateArbeidsforhold == null) return null

    return {
        harFlereArbeidsforhold: booleanOrNullToJaEllerNei(stateArbeidsforhold.harFlereArbeidsforhold),
        sykmeldtFraArbeidsforhold: stateArbeidsforhold.sykmeldtFraArbeidsforhold ?? null,
        // Used only for feature-toggle: 'SYK_INN_AAREG'
        aaregArbeidsforhold: stateArbeidsforhold.sykmeldtFraArbeidsforhold ?? null,
    }
}

export function statePerioderToFormValues(
    statePerioder: NySykmeldingAktivitet[] | null,
): NySykmeldingMainFormValues['perioder'] | null {
    if (statePerioder == null) return null

    return statePerioder.map((it) => toPeriodeFromStatePeriode(it))
}

function toPeriodeFromStatePeriode(aktivitet: NySykmeldingAktivitet): NySykmeldingMainFormValues['perioder'][number] {
    const periode = {
        periode: {
            fom: aktivitet.fom,
            tom: aktivitet.tom,
        },
        aktivitet: {
            type: aktivitet.type,
        },
    }
    switch (aktivitet.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return {
                ...periode,
                aktivitet: {
                    ...periode.aktivitet,
                    grad: null,
                },
                medisinskArsak: {
                    isMedisinskArsak: aktivitet.medisinskArsak.isMedisinskArsak,
                },
                arbeidsrelatertArsak: {
                    isArbeidsrelatertArsak: aktivitet.arbeidsrelatertArsak.isArbeidsrelatertArsak ?? false,
                    arbeidsrelaterteArsaker: aktivitet.arbeidsrelatertArsak.arbeidsrelaterteArsaker ?? null,
                    annenArbeidsrelatertArsak: aktivitet.arbeidsrelatertArsak.annenArbeidsrelatertArsak ?? null,
                },
            }
        case 'GRADERT':
            return {
                ...periode,
                aktivitet: {
                    ...periode.aktivitet,
                    grad: aktivitet.grad ? aktivitet.grad.toFixed(0) : null,
                },
                medisinskArsak: null,
                arbeidsrelatertArsak: null,
            }
    }
}

export function stateHoveddiagnoseToFormValues(stateHoveddiagnose: Diagnose | null): Diagnose | null {
    if (stateHoveddiagnose == null) return null

    return stateHoveddiagnose
}

export function stateBidiagnoserToFormValues(stateBidiagnoser: Diagnose[] | null): Diagnose[] | null {
    if (stateBidiagnoser == null || stateBidiagnoser.length === 0) return null

    return stateBidiagnoser.map((it) => ({
        system: it.system,
        code: it.code,
        text: it.text,
    }))
}

export function stateTilbakedateringToFormValues(
    stateTilbakemelding: NySykmeldingTilbakedatering | null,
): NySykmeldingMainFormValues['tilbakedatering'] | null {
    if (stateTilbakemelding == null) return null

    return {
        fom: stateTilbakemelding.fom && isValid(toDate(stateTilbakemelding.fom)) ? stateTilbakemelding.fom : null,
        grunn: stateTilbakemelding?.grunn ?? null,
        annenGrunn: stateTilbakemelding?.annenGrunn ?? null,
    }
}

export function stateMeldingerToFormValues(
    stateMeldinger: NySykmeldingMeldinger | null,
): NySykmeldingMainFormValues['meldinger'] | null {
    if (stateMeldinger == null) return null

    return {
        showTilNav: stateMeldinger.showTilNav ?? false,
        showTilArbeidsgiver: stateMeldinger.showTilArbeidsgiver ?? false,
        tilNav: stateMeldinger.tilNav ?? null,
        tilArbeidsgiver: stateMeldinger.tilArbeidsgiver ?? null,
    }
}

export function stateAndreSporsmalToFormValues(
    stateAndreSporsmal: NySykmeldingAndreSporsmal | null,
): NySykmeldingMainFormValues['andreSporsmal'] | null {
    if (stateAndreSporsmal == null) return null

    return {
        svangerskapsrelatert: stateAndreSporsmal.svangerskapsrelatert,
        yrkesskade: {
            yrkesskade: stateAndreSporsmal.yrkesskade,
            skadedato: stateAndreSporsmal.yrkesskadeDato,
        },
    }
}

export function stateUtdypendeSporsmalToFormValues(
    stateUtdypendeSporsmal: NySykmeldingUtdypendeSporsmal | null,
): NySykmeldingMainFormValues['utdypendeSporsmal'] | null {
    if (stateUtdypendeSporsmal == null) return null

    return {
        utfordringerMedArbeid: stateUtdypendeSporsmal.utfordringerMedArbeid ?? null,
        medisinskOppsummering: stateUtdypendeSporsmal.medisinskOppsummering ?? null,
        hensynPaArbeidsplassen: stateUtdypendeSporsmal.hensynPaArbeidsplassen ?? null,
        sykdomsutvikling: stateUtdypendeSporsmal.sykdomsutvikling ?? null,
        utfordringerHelsetilstand: stateUtdypendeSporsmal.utfordringerHelsetilstand ?? null,
        behandlingOgFremtidigArbeid: stateUtdypendeSporsmal.behandlingOgFremtidigArbeid ?? null,
        uavklarteForhold: stateUtdypendeSporsmal.uavklarteForhold ?? null,
        oppdatertMedisinskOppsummering: stateUtdypendeSporsmal.oppdatertMedisinskOppsummering ?? null,
        mestringArbeidshverdag: stateUtdypendeSporsmal.mestringArbeidshverdag ?? null,
        forventetHelsetilstandUtvikling: stateUtdypendeSporsmal.forventetHelsetilstandUtvikling ?? null,
        medisinskeHensyn: stateUtdypendeSporsmal.medisinskeHensyn ?? null,
    }
}

export function stateAnnenFravarsgrunnToFormValues(
    stateAnnenFravarsgrunn: NySykmeldingAnnenFravarsgrunn | null,
): NySykmeldingMainFormValues['annenFravarsgrunn'] | null {
    if (stateAnnenFravarsgrunn == null) return null

    return {
        harFravarsgrunn: stateAnnenFravarsgrunn.harFravarsgrunn,
        fravarsgrunn: stateAnnenFravarsgrunn.fravarsgrunn,
    }
}
