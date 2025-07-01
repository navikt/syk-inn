'use client'

import React, { ReactElement } from 'react'
import { useQueryState } from 'nuqs'

import { CallbackError, InvalidCode, UnknownError } from '../launch-errors'

function Page(): ReactElement {
    const [launchError] = useQueryState('reason', { defaultValue: 'unknown', clearOnDefault: true })

    if (launchError === 'invalid-code') {
        return <InvalidCode />
    } else if (launchError === 'callback-failed') {
        return <CallbackError />
    }

    return <UnknownError />
}

export default Page
