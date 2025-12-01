'use client'

import React, { ReactElement } from 'react'
import { BodyShort } from '@navikt/ds-react'

import { getBrowserSessionId } from '@lib/otel/faro'

function SessionIdInfo(): ReactElement {
    return (
        <div className="mt-3 text-text-subtle">
            <BodyShort className="inline">Feilsøkings-ID: </BodyShort>
            <pre className="inline text-base bg-bg-subtle px-1 py-0.5 rounded-md border-border-subtle">
                {getBrowserSessionId() ?? 'ukjent'}
            </pre>
        </div>
    )
}

export default SessionIdInfo
