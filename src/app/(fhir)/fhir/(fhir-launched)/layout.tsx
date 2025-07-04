import React, { PropsWithChildren, ReactElement } from 'react'
import { logger } from '@navikt/next-logger'

import LoggedOutWarning from '@components/user-warnings/LoggedOutWarning'
import NonPilotUserWarning from '@components/user-warnings/NonPilotUserWarning'
import { spanAsync } from '@otel/otel'
import { getHprFromFhirSession } from '@fhir/fhir-service'
import { getFlag, getUserlessToggles, getUserToggles } from '@toggles/unleash'
import { ToggleProvider } from '@toggles/context'

import { NoPractitionerSession, NoValidHPR } from './launched-errors'

async function LaunchedLayout({ children }: PropsWithChildren): Promise<ReactElement> {
    const [toggles, hpr] = await spanAsync('FhirLayout toggles', async () => {
        const hpr = await getHprFromFhirSession()
        if (typeof hpr !== 'string') {
            return [await getUserlessToggles(), hpr]
        }
        return [await getUserToggles(hpr), hpr]
    })

    if (typeof hpr !== 'string') {
        switch (hpr.error) {
            case 'NO_SESSION':
                return <NoPractitionerSession />
            case 'NO_HPR':
                return <NoValidHPR />
        }
    }

    if (!getFlag('PILOT_USER', toggles).enabled) {
        logger.warn(`Non-pilot user has accessed the app, HPR: ${hpr}`)
    }

    return (
        <ToggleProvider toggles={toggles}>
            {children}
            <LoggedOutWarning />
            <NonPilotUserWarning />
        </ToggleProvider>
    )
}

export default LaunchedLayout
