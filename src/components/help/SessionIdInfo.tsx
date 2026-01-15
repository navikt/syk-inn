'use client'

import React, { PropsWithChildren, ReactElement } from 'react'
import { BodyShort } from '@navikt/ds-react'

import { getBrowserSessionId } from '@lib/otel/faro'

function SessionIdInfo({ children }: PropsWithChildren): ReactElement {
    return (
        <div className="mt-3 text-ax-text-neutral-subtle">
            <BodyShort className="inline">Feilsøkings-ID: </BodyShort>
            <pre className="inline text-base bg-ax-bg-neutral-soft px-1 py-0.5 rounded-md border-ax-border-neutral-subtle">
                {getBrowserSessionId() ?? 'ukjent'}
            </pre>
            {children}
        </div>
    )
}

export default SessionIdInfo
