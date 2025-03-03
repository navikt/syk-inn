import React, { ReactElement } from 'react'
import { useForm, DefaultValues } from 'react-hook-form'

import { useFormStep } from '../steps/useFormStep'
import { StepNavigation } from '../steps/StepNavigation'
import { useAppDispatch, useAppSelector } from '../../../providers/redux/hooks'
import { AktivitetStep, nySykmeldingMultistepActions } from '../../../providers/redux/reducers/ny-sykmelding-multistep'

import PeriodePicker, { PeriodeField } from './PeriodePicker'
import AktivitetPicker, { AktivitetField } from './AktivitetPicker'

export type AktivitetFormValues = {
    periode: PeriodeField
    aktivitet: AktivitetField
}

function AktivitetSection(): ReactElement {
    const [, setStep] = useFormStep()
    const existingStep = useAppSelector((state) => state.nySykmeldingMultistep.aktivitet)
    const form = useForm<AktivitetFormValues>({
        defaultValues: createDefaultValues(existingStep),
    })
    const dispatch = useAppDispatch()

    return (
        <div className="mt-8">
            <form
                onSubmit={form.handleSubmit((values) => {
                    dispatch(
                        nySykmeldingMultistepActions.completeAktivitet({
                            type: values.aktivitet.type,
                            grad: values.aktivitet.grad,
                            fom: values.periode.fom,
                            tom: values.periode.tom,
                        }),
                    )
                    setStep(3)
                })}
            >
                <PeriodePicker control={form.control} />
                <AktivitetPicker control={form.control} />
                <StepNavigation previous={1} />
            </form>
        </div>
    )
}

function createDefaultValues(existingStep: AktivitetStep | null): DefaultValues<AktivitetFormValues> {
    if (existingStep == null) {
        return {}
    }

    switch (existingStep.type) {
        case 'AKTIVITET_IKKE_MULIG':
            return {
                periode: {
                    fom: existingStep.fom,
                    tom: existingStep.tom,
                },
                aktivitet: {
                    type: 'AKTIVITET_IKKE_MULIG',
                },
            }
        case 'GRADERT':
            return {
                periode: {
                    fom: existingStep.fom,
                    tom: existingStep.tom,
                },
                aktivitet: {
                    type: 'GRADERT',
                    grad: existingStep.grad,
                },
            }
    }
}

export default AktivitetSection
