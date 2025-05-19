import {
    FieldPath,
    useController as useRhfController,
    UseControllerProps,
    UseControllerReturn,
    useFormContext as useRhfFormContext,
} from 'react-hook-form'

import { DiagnoseSuggestion } from '@components/form/diagnose-combobox/DiagnoseCombobox'

export type PeriodeField = {
    fom: string
    tom: string
}

export type AktivitetIkkeMuligType = 'AKTIVITET_IKKE_MULIG' | 'GRADERT'

export type AktivitetField = {
    type: AktivitetIkkeMuligType
    grad: number
}
export type AktivitetsPeriode = {
    periode: PeriodeField
    aktivitet: AktivitetField
}

export type NySykmeldingMainFormValues = {
    perioder: AktivitetsPeriode[]
    diagnoser: {
        hoved: DiagnoseSuggestion
    }
    meldinger: {
        tilNav: string | null
        tilArbeidsgiver: string | null
    }
    andreSporsmal: ('svangerskapsrelatert' | 'yrkesskade')[]
}

export const useFormContext = useRhfFormContext<NySykmeldingMainFormValues>

export function useController<TFieldName extends FieldPath<NySykmeldingMainFormValues>>(
    props: Omit<UseControllerProps<NySykmeldingMainFormValues, TFieldName>, 'control'>,
): UseControllerReturn<NySykmeldingMainFormValues, TFieldName> {
    return useRhfController<NySykmeldingMainFormValues, TFieldName>(props)
}
