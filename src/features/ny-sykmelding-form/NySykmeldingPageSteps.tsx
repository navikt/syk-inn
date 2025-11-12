'use client'

import React, { PropsWithChildren, ReactElement, ReactNode, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'

import { PageLayout } from '@components/layout/Page'

import { StepSection, useFormStep } from './steps/useFormStep'
import SummarySection from './summary/SummarySection'

function NySykmeldingPageSteps({ heading, children }: PropsWithChildren<{ heading: ReactNode }>): ReactElement {
    const [step] = useFormStep()

    return (
        <AnimateSectionChanges step={step}>
            <Sections heading={heading} section={step}>
                {children}
            </Sections>
        </AnimateSectionChanges>
    )
}

function Sections({
    heading,
    section,
    children,
}: PropsWithChildren<{ heading: ReactNode; section: StepSection }>): ReactElement {
    switch (section) {
        case 'main':
            return (
                <PageLayout heading={heading} bg="white" size="fit">
                    {children}
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
        <div>
            <AnimatePresence initial={false} custom={goingLeft} mode="popLayout">
                <motion.div
                    className="relative"
                    key={step}
                    initial={{ opacity: 0, x: !goingLeft ? -100 : 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: !goingLeft ? 100 : -100 }}
                    transition={{ duration: 0.35 }}
                    layout="size"
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

export default NySykmeldingPageSteps
