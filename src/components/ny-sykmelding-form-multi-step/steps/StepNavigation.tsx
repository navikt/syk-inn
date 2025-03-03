import React, { PropsWithChildren, ReactElement } from 'react'
import { Button, ButtonProps } from '@navikt/ds-react'
import { ArrowLeftIcon, ArrowRightIcon } from '@navikt/aksel-icons'

import { StepSection, useFormStep } from './useFormStep'

export function StepNavigation({ previous }: { previous: StepSection }): ReactElement {
    const [, setStep] = useFormStep()

    return (
        <ButtonsGroup>
            <PreviousStepButton onClick={() => setStep(previous)} />
            <Button
                id="step-navigation-next"
                type="submit"
                variant="primary"
                icon={<ArrowRightIcon aria-hidden />}
                iconPosition="right"
            >
                Neste steg
            </Button>
        </ButtonsGroup>
    )
}

export function PreviousStepButton({
    onClick,
    ...rest
}: { onClick: () => Promise<URLSearchParams> } & Pick<ButtonProps, 'disabled'>): ReactElement {
    return (
        <Button
            type="button"
            variant="secondary"
            icon={<ArrowLeftIcon aria-hidden />}
            iconPosition="left"
            onClick={onClick}
            {...rest}
        >
            Forrige steg
        </Button>
    )
}

export function ButtonsGroup({ children }: PropsWithChildren): ReactElement {
    return <div className="w-full flex justify-end gap-3 mt-16">{children}</div>
}
