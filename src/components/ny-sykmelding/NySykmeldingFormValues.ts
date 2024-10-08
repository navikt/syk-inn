import {
    useController as useRhfController,
    useFormContext as useRhfFormContext,
    FieldPath,
    UseControllerReturn,
    UseControllerProps,
} from 'react-hook-form'

export type NySykmeldingFormValues = {
    context: {
        pasientOid: string | null
        arbeidsgiverOrgnummer: string[] | null
    } | null
    pasient: string | null
    arbeidsgiver: {
        navn: string
        stilling: string
        stillingsprosent: string
    } | null
}

export const useController: <Path extends FieldPath<NySykmeldingFormValues>>(
    props: UseControllerProps<NySykmeldingFormValues, Path>,
) => UseControllerReturn<NySykmeldingFormValues, Path> = useRhfController
export const useFormContext = useRhfFormContext<NySykmeldingFormValues, FieldPath<NySykmeldingFormValues>>
