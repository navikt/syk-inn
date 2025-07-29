import React, { PropsWithChildren, ReactElement } from 'react'

import { cn } from '@lib/tw'

function FormSheet({ children, className }: PropsWithChildren<{ className?: string }>): ReactElement {
    return (
        <div className={cn(className, 'w-[65ch] max-w-prose flex flex-col gap-4 bg-bg-default p-4 rounded-md')}>
            {children}
        </div>
    )
}

export default FormSheet
