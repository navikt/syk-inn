import {
    FieldPath,
    useController as useRhfController,
    UseControllerProps,
    UseControllerReturn,
    useFormContext as useRhfFormContext,
} from 'react-hook-form'

import { DiagnoseFragment } from '@queries'
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
    grad: number | null
}

export type AktivitetsPeriode = {
    periode: PeriodeField
    aktivitet: AktivitetField
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

export type AndreSporsmalValues = 'svangerskapsrelatert' | 'yrkesskade'

export type NySykmeldingMainFormValues = {
    perioder: AktivitetsPeriode[]
    diagnoser: {
        hoved: DiagnoseSuggestion | null
    }
    tilbakedatering: TilbakedateringField | null
    meldinger: MeldingerField
    andreSporsmal: AndreSporsmalValues[]
}

export const useFormContext = useRhfFormContext<NySykmeldingMainFormValues>

export function useController<TFieldName extends FieldPath<NySykmeldingMainFormValues>>(
    props: Omit<UseControllerProps<NySykmeldingMainFormValues, TFieldName>, 'control'>,
): UseControllerReturn<NySykmeldingMainFormValues, TFieldName> {
    return useRhfController<NySykmeldingMainFormValues, TFieldName>(props)
}
