import { dateOnly } from '@lib/date'

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

export function defaultMeldinger(): NySykmeldingMainFormValues['meldinger'] {
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
            periode: {
                fom: dateOnly(new Date()),
                tom: '',
            },
            aktivitet: {
                type: 'BEHANDLINGSDAGER',
                grad: null,
                arbeidsrelatertArsak: null,
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
            grad: null,
            arbeidsrelatertArsak: null,
        },
    }
}
