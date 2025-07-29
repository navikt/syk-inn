import React, { ReactElement, useState } from 'react'
import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns'
import { nb } from 'date-fns/locale/nb'

import useInterval from '@lib/hooks/useInterval'

export function AutoUpdatingDistance({ time }: { time: string }): ReactElement {
    const [rerernderino, triggerino] = useState(0)
    const diffInSeconds = differenceInSeconds(new Date(), time)

    /**
     * More than 5 minutes: 1 minute rerender
     * More than 1 minute: 10 seconds rerender
     * Less than 1 minute: 5 second rerender
     */
    const rerenderIntervalMs = diffInSeconds > 300 ? 1000 * 60 : diffInSeconds > 60 ? 1000 * 10 : 5000

    useInterval(() => {
        triggerino((prev) => prev + 1)
    }, rerenderIntervalMs)

    return (
        <React.Fragment key={rerernderino}>
            {formatDistanceToNowStrict(time, { locale: nb, addSuffix: true })}
        </React.Fragment>
    )
}
