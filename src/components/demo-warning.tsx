import React, { ReactElement } from 'react'
import { Alert, BodyShort, Link as AskelLink } from '@navikt/ds-react'
import Link from 'next/link'

import { isLocal, isDemo } from '@utils/env'
import { raise } from '@utils/ts'

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
                    <AskelLink as={Link} href="/">
                        ← Back to development page
                    </AskelLink>
                </div>
            </Alert>
        </div>
    )
}

export default DemoWarning
