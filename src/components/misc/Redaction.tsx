import React, { ReactElement } from 'react'

import { cn } from '@lib/tw'

import styles from './Redaction.module.css'

interface Props {
    title: string
    className?: string
}

function Redaction({ title, className }: Props): ReactElement {
    return (
        <div className={cn('rounded-sm h-4 w-42', styles.redaction, className)}>
            <p className="sr-only">{title}</p>
        </div>
    )
}

export default Redaction
