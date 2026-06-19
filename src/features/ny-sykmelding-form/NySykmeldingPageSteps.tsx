'use client'

import React, { PropsWithChildren, ReactElement, ReactNode } from 'react'

import { PageLayout } from '#components/layout/Page'

import SummarySection from './summary/SummarySection'
import { StepSection, useFormStep } from './useFormStep'

function NySykmeldingPageSteps({ heading, children }: PropsWithChildren<{ heading: ReactNode }>): ReactElement {
    const [step] = useFormStep()

    return (
        <Sections heading={heading} section={step}>
            {children}
        </Sections>
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

export default NySykmeldingPageSteps
