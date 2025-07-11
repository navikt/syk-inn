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

import { ArbeidsrelatertArsakType, DiagnoseFragment } from '@queries'
import { DiagnoseSuggestion } from '@components/form/diagnose-combobox/DiagnoseCombobox'

export type NySykmeldingSuggestions = {
    diagnose: {
        value: DiagnoseFragment | null
        error?: { error: 'FHIR_FAILED' }
    }
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
    grunn: string | null
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
}

type AndreSporsmalFields = {
    svangerskapsrelatert: boolean
    yrkesskade: {
        yrkesskade: boolean
        skadedato: string | null
    } | null
}

export type NySykmeldingMainFormValues = {
    arbeidsforhold: ArbeidsforholdField
    perioder: AktivitetsPeriode[]
    diagnoser: {
        hoved: DiagnoseSuggestion | null
        bidiagnoser: (DiagnoseSuggestion | null)[]
    }
    tilbakedatering: TilbakedateringField | null
    meldinger: MeldingerField
    andreSporsmal: AndreSporsmalFields
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
