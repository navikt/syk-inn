'use client'

import { Heading } from '@navikt/ds-react'
import { AnimatePresence, motion } from 'motion/react'
import React, { PropsWithChildren, ReactElement } from 'react'

import useInterval from '#lib/hooks/useInterval'
import { cn } from '#lib/tw'

const quips = ['Sjekker FHIR ressurser...', 'Validerer data...', 'Ser etter feil...', 'Justerer flux capacitor...']

export function LoadingQuips(): ReactElement {
    const [quip, setQuip] = React.useState<string | null>(quips[Math.floor(Math.random() * quips.length)])
    useInterval(() => {
        setQuip(quips[Math.floor(Math.random() * quips.length)])
    }, 1300)

    return (
        <div className="h-12">
            <AnimatePresence>
                <SlideInReveal key={quip} className="absolute">
                    <Heading level="3" size="medium" spacing>
                        {quip}
                    </Heading>
                </SlideInReveal>
            </AnimatePresence>
        </div>
    )
}

function SlideInReveal({ className, children }: PropsWithChildren<{ className?: string }>): ReactElement {
    return (
        <motion.div
            className={cn(className, 'overflow-hidden p-2 -m-2')}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
        >
            {children}
        </motion.div>
    )
}
