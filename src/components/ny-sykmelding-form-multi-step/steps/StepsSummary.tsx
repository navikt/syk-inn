import { Stepper } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useAppSelector } from '../../../providers/redux/hooks'

import { useFormStep } from './useFormStep'

function StepsSummary(): ReactElement {
    const [step, setStep] = useFormStep()
    const formState = useAppSelector((state) => state.nySykmeldingMultistep)

    return (
        <Stepper aria-labelledby="stepper-heading" activeStep={step} interactive className="mt-8">
            <Stepper.Step as="button" onClick={() => setStep(1)} interactive completed={formState.pasient != null}>
                Innledning
            </Stepper.Step>
            <Stepper.Step
                as="button"
                onClick={() => setStep(2)}
                interactive={step > 2}
                completed={formState.aktivitet != null}
            >
                Aktivitet
            </Stepper.Step>
            <Stepper.Step
                as="button"
                interactive={step > 3}
                onClick={() => setStep(3)}
                completed={formState.diagnose != null}
            >
                Diagnose
            </Stepper.Step>
            <Stepper.Step
                as="button"
                onClick={() => setStep(4)}
                interactive={formState.pasient != null && formState.aktivitet != null && formState.diagnose != null}
            >
                Oppsummering
            </Stepper.Step>
        </Stepper>
    )
}

export default StepsSummary
