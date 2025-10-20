'use client'

import React, { ReactElement } from 'react'
import { Heading, HeadingProps, Skeleton } from '@navikt/ds-react'
import { AnimatePresence, motion } from 'motion/react'

export type LoadableHeaderProps = {
    lead: string
    tail?: string
    value: string | null
    skeletonWidth?: number
    id?: string
}

function LoadableHeader({
    lead,
    value,
    tail,
    level,
    size,
    id,
    skeletonWidth = 140,
}: LoadableHeaderProps & Pick<HeadingProps, 'level' | 'size'>): ReactElement {
    return (
        <Heading level={level} size={size} spacing className="flex gap-2" id={id}>
            <span>{lead}</span>
            <AnimatePresence mode="wait" initial={false}>
                {value == null ? (
                    <motion.div
                        className="inline-block"
                        key="skeleton"
                        initial={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 20 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Skeleton width={skeletonWidth} />
                    </motion.div>
                ) : (
                    <motion.span
                        key="value"
                        className="inline-block"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                    >
                        {value}
                    </motion.span>
                )}
            </AnimatePresence>
            {tail && <span>{tail}</span>}
        </Heading>
    )
}
export default LoadableHeader
