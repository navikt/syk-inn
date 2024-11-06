import {
    useController as useRhfController,
    useFormContext as useRhfFormContext,
    FieldPath,
    UseControllerReturn,
    UseControllerProps,
} from 'react-hook-form'

import { DiagnoseSuggestion } from '@components/ny-sykmelding-form/diagnose/combobox/DiagnoseCombobox'

export type AktivitetIkkeMuligType = 'AKTIVITET_IKKE_MULIG' | 'GRADERT'

export type AktivitetFormValue = {
    type: AktivitetIkkeMuligType
    fom: string | null
    tom: string | null
    grad: number | null
}

export type NySykmeldingFormValues = {
    context: {
        pasientOid: string | null
        arbeidsgiverOrgnummer: string[] | null
    } | null
    pasient: string | null
    arbeidssituasjon: {
        situasjon: 'en' | 'flere' | 'ingen'
        arbeidsgiver: {
            navn: string
            stilling: string
            stillingsprosent: string
        } | null
    }
    diagnoser: {
        hoved: DiagnoseSuggestion | null
        bi: DiagnoseSuggestion[] | null
    }
    aktivitet: AktivitetFormValue
}

export const useController: <Path extends FieldPath<NySykmeldingFormValues>>(
    props: UseControllerProps<NySykmeldingFormValues, Path>,
) => UseControllerReturn<NySykmeldingFormValues, Path> = useRhfController
export const useFormContext = useRhfFormContext<NySykmeldingFormValues, FieldPath<NySykmeldingFormValues>>
