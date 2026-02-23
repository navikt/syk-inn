import {
    FieldPath,
    useController as useRhfController,
    UseControllerProps,
    UseControllerReturn,
    useFormContext as useRhfFormContext,
    useFieldArray as useRhfFieldArray,
    FieldArrayPath,
    UseFieldArrayProps,
    UseFieldArrayReturn,
} from 'react-hook-form'

import { Diagnose } from '@data-layer/common/diagnose'
import { TilbakedateringGrunn } from '@data-layer/common/tilbakedatering'
import { AnnenFravarsgrunnArsak, ArbeidsrelatertArsakType, DiagnoseFragment } from '@queries'

export type NySykmeldingSuggestions = {
    diagnose: {
        value: DiagnoseFragment | null
        error?: { error: 'FHIR_FAILED' }
    }
    bidiagnoser: DiagnoseFragment[] | null
}

export type PeriodeField = {
    fom: string | null
    tom: string | null
}

export type AktivitetIkkeMuligType = 'AKTIVITET_IKKE_MULIG' | 'GRADERT'
export type AktivitetField = {
    type: AktivitetIkkeMuligType
    grad: string | null
}

export type AktivitetsPeriode = {
    periode: PeriodeField
    aktivitet: AktivitetField
    medisinskArsak: MedisinskArsakField | null
    arbeidsrelatertArsak: ArbeidsrelatertArsakField | null
}

export type MedisinskArsakField = {
    isMedisinskArsak: boolean | null
}

export type ArbeidsrelatertArsakField = {
    isArbeidsrelatertArsak: boolean
    arbeidsrelaterteArsaker: ArbeidsrelatertArsakType[] | null
    annenArbeidsrelatertArsak: string | null
}

export type TilbakedateringField = {
    fom: string | null
    grunn: TilbakedateringGrunn | null
    annenGrunn: string | null
}

type MeldingerField = {
    showTilNav: boolean
    tilNav: string | null
    showTilArbeidsgiver: boolean
    tilArbeidsgiver: string | null
}

type ArbeidsforholdField = {
    harFlereArbeidsforhold: 'JA' | 'NEI' | null
    sykmeldtFraArbeidsforhold: string | null
    // Used only for feature-toggle: 'SYK_INN_AAREG'
    aaregArbeidsforhold: string | null
}

type AndreSporsmalFields = {
    svangerskapsrelatert: boolean
    yrkesskade: {
        yrkesskade: boolean
        skadedato: string | null
    } | null
}

type AnnenFravarsgrunnFields = {
    harFravarsgrunn: boolean
    fravarsgrunn: AnnenFravarsgrunnArsak | null
}

type UtdypendeSporsmalFields = {
    utfordringerMedArbeid: string | null
    medisinskOppsummering: string | null
    hensynPaArbeidsplassen: string | null
    sykdomsutvikling: string | null
    arbeidsrelaterteUtfordringer: string | null
    behandlingOgFremtidigArbeidArbeid: string | null
    uavklarteForhold: string | null
    oppdatertMedisinskStatus: string | null
    realistiskMestringArbeid: string | null
    forventetHelsetilstandUtvikling: string | null
    medisinskeHensyn: string | null
}

export type NySykmeldingMainFormValues = {
    arbeidsforhold: ArbeidsforholdField
    perioder: AktivitetsPeriode[]
    diagnoser: {
        hoved: Diagnose | null
        bidiagnoser: (Diagnose | null)[]
    }
    tilbakedatering: TilbakedateringField | null
    meldinger: MeldingerField
    andreSporsmal: AndreSporsmalFields
    annenFravarsgrunn: AnnenFravarsgrunnFields
    utdypendeSporsmal: UtdypendeSporsmalFields | null
}

export const useFormContext = useRhfFormContext<NySykmeldingMainFormValues>

export function useController<TFieldName extends FieldPath<NySykmeldingMainFormValues>>(
    props: Omit<UseControllerProps<NySykmeldingMainFormValues, TFieldName>, 'control'>,
): UseControllerReturn<NySykmeldingMainFormValues, TFieldName> {
    return useRhfController<NySykmeldingMainFormValues, TFieldName>(props)
}

export function useFieldArray<
    TFieldArrayName extends FieldArrayPath<NySykmeldingMainFormValues> = FieldArrayPath<NySykmeldingMainFormValues>,
>(
    props: UseFieldArrayProps<NySykmeldingMainFormValues, TFieldArrayName>,
): UseFieldArrayReturn<NySykmeldingMainFormValues, TFieldArrayName> {
    return useRhfFieldArray<NySykmeldingMainFormValues, TFieldArrayName>(props)
}
