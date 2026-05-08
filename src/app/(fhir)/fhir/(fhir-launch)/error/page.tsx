import React, { ReactElement } from 'react'

import { CallbackError, InvalidCode, UnknownError, WeUpgradinError } from '../launch-errors'

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
    } else if (launchError === 'oppgradering') {
        return <WeUpgradinError />
    }

    return <UnknownError />
}

export default Page
