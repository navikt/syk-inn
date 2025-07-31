import React, { ReactElement } from 'react'
import { Alert, BodyShort } from '@navikt/ds-react'

import { isLocal, isDemo } from '@lib/env'
import { raise } from '@lib/ts'
import AkselNextLink from '@components/links/AkselNextLink'

function DemoWarning(): ReactElement | null {
    if (!(isLocal || isDemo)) {
        raise(new Error('DemoWarning should only be rendered in local or demo environment'))
    }

    return (
        <div className="p-4  flex items-center justify-center w-full">
            <Alert variant="warning" className="max-w-prose" size="small">
                <BodyShort className="font-bold mb-0.5" size="small">
                    Dette er en demoside og inneholder ikke dine personlige data.
                </BodyShort>
                <div className="text-xs">
                    <AkselNextLink href="/">← Back to development page</AkselNextLink>
                </div>
            </Alert>
        </div>
    )
}

export default DemoWarning
