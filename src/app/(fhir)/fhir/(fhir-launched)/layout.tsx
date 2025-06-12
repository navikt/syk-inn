'use client'

import React, { PropsWithChildren, ReactElement } from 'react'

import NonPilotUserWarning from '@components/user-warnings/NonPilotUserWarning'

function LaunchedLayout({ children }: PropsWithChildren): ReactElement {
    return (
        <>
            {children}
            <NonPilotUserWarning />
        </>
    )
}

export default LaunchedLayout
