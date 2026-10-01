import { differenceInSeconds, formatDistanceToNowStrict } from 'date-fns'
import { nb } from 'date-fns/locale/nb'
import React, { ReactElement, useState } from 'react'

import useInterval from '#lib/hooks/useInterval'

export function AutoUpdatingDistance({ time }: { time: string }): ReactElement {
    const [now, setNow] = useState(() => new Date())
    const diffInSeconds = differenceInSeconds(now, time)

    /**
     * More than 5 minutes: 1 minute rerender
     * More than 1 minute: 10 seconds rerender
     * Less than 1 minute: 5 second rerender
     */
    const rerenderIntervalMs = diffInSeconds > 300 ? 1000 * 60 : diffInSeconds > 60 ? 1000 * 10 : 5000

    useInterval(() => {
        setNow(new Date())
    }, rerenderIntervalMs)

    return (
        <React.Fragment key={now.toISOString()}>
            {formatDistanceToNowStrict(time, { locale: nb, addSuffix: true })}
        </React.Fragment>
    )
}
