'use client'

import React, { PropsWithChildren, ReactElement, ReactNode, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { PageLayout } from '@components/layout/Page'

import { StepSection, useFormStep } from './steps/useFormStep'
import SummarySection from './summary/SummarySection'
import NySykmeldingFormWithData from './NySykmeldingFormWithData'

function NySykmeldingPageSteps({ heading }: { heading: ReactNode }): ReactElement {
    const [step] = useFormStep()

    return (
        <AnimateSectionChanges step={step}>
            <Sections heading={heading} section={step} />
        </AnimateSectionChanges>
    )
}

function Sections({ heading, section }: { heading: ReactNode; section: StepSection }): ReactElement {
    switch (section) {
        case 'main':
            return (
                <PageLayout heading={heading} bg="white" size="fit">
                    <NySykmeldingFormWithData />
                </PageLayout>
            )
        case 'summary':
            return (
                <PageLayout heading={heading} bg="transparent" size="fit">
                    <SummarySection />
                </PageLayout>
            )
    }
}

function AnimateSectionChanges({ step, children }: PropsWithChildren<{ step: string }>): ReactElement {
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
                    className="absolute pb-16"
                    key={step}
                    initial={{ opacity: 0, x: !goingLeft ? -100 : 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: !goingLeft ? 100 : -100 }}
                    transition={{ duration: 0.1 }}
                    layout="size"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default NySykmeldingPageSteps
