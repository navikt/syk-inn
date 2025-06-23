import React, { PropsWithChildren, ReactElement } from 'react'
import { motion } from 'motion/react'

import { cn } from '@utils/tw'

export function SimpleReveal({ className, children }: PropsWithChildren<{ className?: string }>): ReactElement {
    return (
        <motion.div
            className={cn(className, 'overflow-hidden p-2 -m-2')}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'circInOut' }}
        >
            {children}
        </motion.div>
    )
}

export function FastFadeReveal({ className, children }: PropsWithChildren<{ className?: string }>): ReactElement {
    return (
        <motion.div
            className={cn(className, 'overflow-hidden p-2 -m-2')}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1, ease: 'linear' }}
        >
            {children}
        </motion.div>
    )
}
