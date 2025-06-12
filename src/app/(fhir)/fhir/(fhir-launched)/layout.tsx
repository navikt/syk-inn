import React, { PropsWithChildren, ReactElement } from 'react'
import { logger } from '@navikt/next-logger'

import NonPilotUserWarning from '@components/user-warnings/NonPilotUserWarning'
import { spanAsync } from '@otel/otel'
import { getHprFromPractitioner } from '@fhir/fhir-service'
import { getFlag, getToggles } from '@toggles/unleash'
import { ToggleProvider } from '@toggles/context'

async function LaunchedLayout({ children }: PropsWithChildren): Promise<ReactElement> {
    const [toggles, hpr] = await spanAsync('FhirLayout toggles', async () => {
        const hpr = await getHprFromPractitioner()
        return [await getToggles(hpr), hpr]
    })

    if (!getFlag('PILOT_USER', toggles).enabled) {
        logger.warn(`Non-pilot user has accessed the app, HPR: ${hpr}`)
    }

    return (
        <ToggleProvider toggles={toggles}>
            {children}
            <NonPilotUserWarning />
        </ToggleProvider>
    )
}

export default LaunchedLayout
