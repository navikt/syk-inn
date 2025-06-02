import React, { PropsWithChildren, ReactElement } from 'react'
import { motion } from 'motion/react'

export function SimpleReveal({ children }: PropsWithChildren): ReactElement {
    return (
        <motion.div
            className="overflow-hidden p-2 -m-2"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'circInOut' }}
        >
            {children}
        </motion.div>
    )
}
