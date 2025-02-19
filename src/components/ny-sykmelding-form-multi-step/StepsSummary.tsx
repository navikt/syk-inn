import { Stepper } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useFormStep } from '@components/ny-sykmelding-form-multi-step/useFormStep'

import { useAppSelector } from '../../providers/redux/hooks'

function StepsSummary(): ReactElement {
    const [step, setStep] = useFormStep()
    const formState = useAppSelector((state) => state.nySykmeldingMultistep)

    return (
        <Stepper aria-labelledby="stepper-heading" activeStep={step} interactive>
            <Stepper.Step as="button" onClick={() => setStep(1)} completed={formState.pasient?.fnr != null}>
                Pasient
            </Stepper.Step>
            <Stepper.Step href="#" interactive={false}>
                Diagnose
            </Stepper.Step>
            <Stepper.Step href="#" interactive={false}>
                Arbeidsforhold
            </Stepper.Step>
            <Stepper.Step href="#" interactive={false}>
                Aktivitet
            </Stepper.Step>
            <Stepper.Step href="#" interactive={false}>
                Oppsummering
            </Stepper.Step>
        </Stepper>
    )
}

export default StepsSummary
