import { Stepper } from '@navikt/ds-react'
import React, { ReactElement } from 'react'

import { useAppSelector } from '../../../providers/redux/hooks'

import { useFormStep } from './useFormStep'

function StepsSummary(): ReactElement {
    const [step, setStep] = useFormStep()
    const formState = useAppSelector((state) => state.nySykmeldingMultistep)

    return (
        <Stepper aria-labelledby="stepper-heading" activeStep={step} interactive className="mt-8">
            <Stepper.Step
                as="button"
                onClick={() => setStep(1)}
                interactive={step > 1}
                completed={formState.aktivitet != null}
            >
                Aktivitet
            </Stepper.Step>
            <Stepper.Step
                as="button"
                interactive={step > 2}
                onClick={() => setStep(2)}
                completed={formState.diagnose != null}
            >
                Diagnose
            </Stepper.Step>
            <Stepper.Step
                as="button"
                onClick={() => setStep(3)}
                interactive={formState.pasient != null && formState.aktivitet != null && formState.diagnose != null}
            >
                Oppsummering
            </Stepper.Step>
        </Stepper>
    )
}

export default StepsSummary
