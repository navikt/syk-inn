import React, { ReactElement } from 'react'

import { cn } from '@lib/tw'

import styles from './Redaction.module.css'

interface Props {
    className?: string
}

function Redaction({ className }: Props): ReactElement {
    return <div className={cn('rounded-sm h-4 w-42', styles.redaction, className)} />
}

export default Redaction
