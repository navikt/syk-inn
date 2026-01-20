import { AktivitetsPeriode, NySykmeldingMainFormValues } from '@features/ny-sykmelding-form/form/types'
import { dateOnly } from '@lib/date'

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
        behandlingOgFremtidigArbeid: null,
        uavklarteForhold: null,
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

export function defaultPeriode(): AktivitetsPeriode {
    return {
        periode: {
            fom: dateOnly(new Date()),
            tom: '',
        },
        aktivitet: {
            type: 'GRADERT',
            grad: null,
        },
        medisinskArsak: null,
        arbeidsrelatertArsak: null,
    }
}
