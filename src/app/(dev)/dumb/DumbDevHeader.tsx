'use client'

import React, { ReactElement, useEffect, useRef } from 'react'
import { Detail } from '@navikt/ds-react'
import { AnimatePresence, stagger } from 'motion/react'
import { animate } from 'motion'

import { FastFadeReveal } from '@components/animation/Reveal'

function DumbDevHeader(): ReactElement {
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        document.fonts.ready.then(() => {
            if (!containerRef.current) return

            const { chars } = splitTextA(containerRef.current.querySelector('.wavy')!)

            const staggerDelay = 0.15

            animate(
                chars,
                { y: [-20, 20] },
                {
                    repeat: Infinity,
                    repeatType: 'mirror',
                    ease: 'easeInOut',
                    duration: 2,
                    delay: stagger(staggerDelay, { startDelay: -staggerDelay * chars.length }),
                },
            )
        })
    }, [])

    return (
        <AnimatePresence>
            <FastFadeReveal>
                <div ref={containerRef}>
                    <span>
                        Utviklingsside for <span className="wavy">syk-inn</span>
                    </span>
                    <Detail className="-mt-2">
                        Denne siden er ikke synlig i dev-gcp eller prod-gcp, kun lokal utvikling og demo
                    </Detail>
                </div>
            </FastFadeReveal>
        </AnimatePresence>
    )
}

function splitTextA(element: Element): { chars: Element[] } {
    const text = element.textContent || ''
    element.textContent = ''

    const chars = Array.from(text).map((char, index) => {
        const span = document.createElement('span')
        span.textContent = char
        span.className = 'split-char'
        span.setAttribute('data-index', index.toString())
        span.style = 'display: inline-block;'
        element.appendChild(span)
        return span
    })

    return { chars }
}

export default DumbDevHeader
