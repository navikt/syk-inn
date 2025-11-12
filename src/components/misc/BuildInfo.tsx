import React, { PropsWithChildren, ReactElement } from 'react'
import { format } from 'date-fns'
import { nb } from 'date-fns/locale/nb'

import { bundledEnv } from '@lib/env'

function BuildInfo(): ReactElement {
    if (bundledEnv.NEXT_PUBLIC_VERSION === 'development') {
        return <BuildInfoInCorner>Versjon: dev</BuildInfoInCorner>
    }

    const date = bundledEnv.NEXT_PUBLIC_BUILD_TIME
        ? format(bundledEnv.NEXT_PUBLIC_BUILD_TIME, `d. MMM HH:mm`, { locale: nb })
        : 'Ukjent tidspunkt'

    return (
        <BuildInfoInCorner>
            <div>
                Versjon:{' '}
                <a
                    href={`https://github.com/navikt/syk-inn/commit/${bundledEnv.NEXT_PUBLIC_VERSION}`}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {bundledEnv.NEXT_PUBLIC_VERSION?.slice(0, 7)}
                </a>
            </div>
            <div>{date}</div>
        </BuildInfoInCorner>
    )
}

function BuildInfoInCorner({ children }: PropsWithChildren): ReactElement {
    return <div className="fixed top-2 right-2 text-text-subtle text-sm text-right">{children}</div>
}

export default BuildInfo
