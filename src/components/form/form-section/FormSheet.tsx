import React, { PropsWithChildren, ReactElement } from 'react'

import { cn } from '@lib/tw'

function FormSheet({ children, className }: PropsWithChildren<{ className?: string }>): ReactElement {
    return <div className={cn(className, 'w-[65ch] max-w-prose flex flex-col gap-4 p-4')}>{children}</div>
}

export default FormSheet
