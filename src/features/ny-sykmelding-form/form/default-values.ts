import { dateOnly } from '#lib/date'

import { NySykmeldingFormVariantType } from '../useFormVariant'

import { AktivitetsPeriode, NySykmeldingMainFormValues } from './types'

export function defaultArbeidsforhold(): NySykmeldingMainFormValues['arbeidsforhold'] {
    return {
        harFlereArbeidsforhold: 'NEI',
        sykmeldtFraArbeidsforhold: null,
        // Used only for feature-toggle: 'SYK_INN_AAREG'
        aaregArbeidsforhold: null,
    }
}

export function defaultAndreSporsmal(): NySykmeldingMainFormValues['andreSporsmal'] {
    return {
        svangerskapsrelatert: false,
        yrkesskade: {
            yrkesskade: false,
            skadedato: null,
        },
    }
}

export function defaultUtdypendeSporsmal(): NySykmeldingMainFormValues['utdypendeSporsmal'] {
    return {
        utfordringerMedArbeid: null,
        medisinskOppsummering: null,
        hensynPaArbeidsplassen: null,
        sykdomsutvikling: null,
        arbeidsrelaterteUtfordringer: null,
        behandlingOgFremtidigArbeid: null,
        uavklarteForhold: null,
        oppdatertMedisinskStatus: null,
        realistiskMestringArbeid: null,
        forventetHelsetilstandUtvikling: null,
        medisinskeHensyn: null,
    }
}

export function defaultAnnenfravarsgrunn(): NySykmeldingMainFormValues['annenFravarsgrunn'] {
    return {
        harFravarsgrunn: false,
        fravarsgrunn: null,
    }
}

export function defaultTilbakedatering(): NySykmeldingMainFormValues['tilbakedatering'] {
    return null
}

export function defaultMeldinger(variant: NySykmeldingFormVariantType): NySykmeldingMainFormValues['meldinger'] {
    if (variant === 'BEHANDLINGSDAGER') {
        return {
            showTilNav: true,
            tilNav: null,
            showTilArbeidsgiver: false,
            tilArbeidsgiver: null,
        }
    }

    return {
        showTilNav: false,
        tilNav: null,
        showTilArbeidsgiver: false,
        tilArbeidsgiver: null,
    }
}

export function defaultPeriode(variant: NySykmeldingFormVariantType): AktivitetsPeriode {
    if (variant === 'BEHANDLINGSDAGER') {
        return {
            periode: { fom: dateOnly(new Date()), tom: '' },
            aktivitet: {
                type: 'BEHANDLINGSDAGER',
                gradert: {
                    grad: null,
                    reisetilskudd: false,
                },
                aktivitetIkkeMulig: {
                    isArbeidsrelatertArsak: false,
                    arbeidsrelaterteArsaker: null,
                    annenArbeidsrelatertArsak: null,
                },
            },
        }
    } else if (variant === 'REISETILSKUDD') {
        return {
            periode: { fom: dateOnly(new Date()), tom: '' },
            aktivitet: {
                type: 'REISETILSKUDD',
                gradert: { grad: null, reisetilskudd: false },
                aktivitetIkkeMulig: {
                    isArbeidsrelatertArsak: false,
                    arbeidsrelaterteArsaker: null,
                    annenArbeidsrelatertArsak: null,
                },
            },
        }
    }

    return {
        periode: {
            fom: dateOnly(new Date()),
            tom: '',
        },
        aktivitet: {
            type: 'GRADERT',
            gradert: {
                grad: null,
                reisetilskudd: false,
            },
            aktivitetIkkeMulig: {
                isArbeidsrelatertArsak: false,
                arbeidsrelaterteArsaker: null,
                annenArbeidsrelatertArsak: null,
            },
        },
    }
}
