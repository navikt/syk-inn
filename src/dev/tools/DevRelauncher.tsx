'use client'

import React, { ReactElement } from 'react'
import { Alert, BodyShort, Heading } from '@navikt/ds-react'
import { logger } from '@navikt/next-logger'

import useInterval from '@lib/hooks/useInterval'
import { getAbsoluteURL, pathWithBasePath } from '@lib/url'
import { isLocal, isDemo } from '@lib/env'

function DevRelauncher(): ReactElement | null {
    const [relaunchIn, setRelaunchIn] = React.useState(3)

    useInterval(() => {
        if (relaunchIn > 0) {
            setRelaunchIn(relaunchIn - 1)
        } else {
            window.location.href = pathWithBasePath(
                `/fhir/launch?iss=${`${getAbsoluteURL()}/api/mocks/fhir&launch=local-dev-launch-espen`}`,
            )
        }
    }, 1000)

    if (!(isLocal || isDemo)) {
        logger.error('DevTool in production, why?!')
        return null
    }

    return (
        <Alert variant="warning" className="mb-4">
            <Heading size="medium" level="2">
                Seems you have been logged out in local development mode!
            </Heading>
            <BodyShort>Relaunching in {relaunchIn} seconds...</BodyShort>
        </Alert>
    )
}

export default DevRelauncher
