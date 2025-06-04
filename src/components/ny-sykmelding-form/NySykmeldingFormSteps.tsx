'use client'

import React, { ReactElement, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { StepSection, useFormStep } from './steps/useFormStep'
import SummarySection from './summary/SummarySection'
import NySykmeldingFormWithData from './NySykmeldingFormWithData'

function NySykmeldingFormSteps(): ReactElement {
    const [step] = useFormStep()
    const [prevStep, setPrevStep] = useState(step)
    const [direction, setDirection] = useState<-1 | 1>(1)

    if (step !== prevStep) {
        setPrevStep(step)
        setDirection(step > prevStep ? 1 : -1)
    }

    const goingLeft = direction === 1

    return (
        <div className="relative">
            <AnimatePresence initial={false} custom={goingLeft}>
                <motion.div
                    className="absolute w-full pb-16"
                    key={step}
                    initial={{ opacity: 0, x: !goingLeft ? -100 : 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: !goingLeft ? 100 : -100 }}
                    transition={{ duration: 0.1 }}
                    layout="size"
                >
                    <Sections section={step} />
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

function Sections({ section }: { section: StepSection }): ReactElement {
    switch (section) {
        case 'main':
            return <NySykmeldingFormWithData />
        case 'summary':
            return <SummarySection />
    }
}

export default NySykmeldingFormSteps
