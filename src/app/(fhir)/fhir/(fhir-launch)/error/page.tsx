import React, { ReactElement } from 'react'

import { CallbackError, InvalidCode, UnknownError } from '../launch-errors'

type Props = {
    searchParams: Promise<{
        reason?: string
    }>
}

async function Page({ searchParams }: Props): Promise<ReactElement> {
    const launchError = (await searchParams).reason ?? 'unknown'

    if (launchError === 'invalid-code') {
        return <InvalidCode />
    } else if (launchError === 'callback-failed') {
        return <CallbackError />
    }

    return <UnknownError />
}

export default Page
