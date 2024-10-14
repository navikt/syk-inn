import { PropsWithChildren, ReactElement } from 'react'
import { BodyShort, Heading } from '@navikt/ds-react'

import { isLocalOrDemo } from '@utils/env'
import { cn } from '@utils/tw'

import demoArrow from './demo-arrow.webp'

type Props = {
    title: string
    // TODO: Only temporary property used to inline som visual annotations for the development form
    demoDescription?: string | string[]
    demoBottom?: boolean
}

export function FormSection({ children, title, demoDescription, demoBottom }: PropsWithChildren<Props>): ReactElement {
    return (
        <div className="relative">
            <section className="p-4 bg-bg-subtle rounded">
                <Heading level="2" size="medium">
                    {title}
                </Heading>
                {children}
            </section>
            {isLocalOrDemo && demoDescription && (
                <div
                    className={cn(
                        'hidden lg:block absolute top-4 -right-[380px] bg-surface-action-subtle-hover max-w-[360px] rounded border-2 border-t-border-alt-3',
                        { 'bottom-4 top-auto': demoBottom },
                    )}
                >
                    <div className="overflow-auto h-full w-full p-2">
                        {Array.isArray(demoDescription) ? (
                            demoDescription.map((text, i) => (
                                <BodyShort key={i} spacing={i < demoDescription.length - 1}>
                                    {text}
                                </BodyShort>
                            ))
                        ) : (
                            <BodyShort>{demoDescription}</BodyShort>
                        )}
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={demoArrow.src}
                        alt=""
                        width={240}
                        height={120}
                        className="h-[56px] absolute -bottom-[60px]"
                    />
                </div>
            )}
        </div>
    )
}
