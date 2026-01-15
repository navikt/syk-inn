import React, { PropsWithChildren, ReactElement } from 'react'

import { cn } from '@lib/tw'

function FormSheet({ children, className }: PropsWithChildren<{ className?: string }>): ReactElement {
    return <div className={cn(className, 'w-full ax-lg:max-w-[65ch] flex flex-col gap-4 p-4')}>{children}</div>
}

export default FormSheet
