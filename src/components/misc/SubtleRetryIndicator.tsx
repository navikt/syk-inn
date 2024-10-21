import React, { ReactElement } from 'react'

type Props = {
    failureCount: number | undefined
}

function SubtleRetryIndicator({ failureCount }: Props): ReactElement | null {
    if (failureCount == null || failureCount === 0) {
        return null
    }

    return <span>{'.'.repeat(failureCount - 1)}</span>
}

export default SubtleRetryIndicator
