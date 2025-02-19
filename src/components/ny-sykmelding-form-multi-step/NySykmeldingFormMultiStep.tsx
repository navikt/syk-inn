'use client'

import React, { ReactElement } from 'react'

import StepsSummary from './StepsSummary'
import FormSteps from './FormSteps'

function NySykmeldingFormMultiStep(): ReactElement {
    return (
        <div className="flex">
            <div className="w-full">
                <FormSteps />
            </div>
            <div className="w-full ml-8">
                <StepsSummary />
            </div>
        </div>
    )
}

export default NySykmeldingFormMultiStep
