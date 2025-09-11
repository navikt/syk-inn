import React, { ReactElement } from 'react'
import { logger } from '@navikt/next-logger'
import { redirect } from 'next/navigation'

import MultiUserQueryStateToSessionStorageOnInit from '@data-layer/fhir/multi-user/MultiUserQueryStateToSessionStorageOnInit'
import { getHprFromFhirSession } from '@data-layer/fhir/fhir-service'
import LoggedOutWarning from '@components/user-warnings/LoggedOutWarning'
import { NoValidHPR } from '@components/errors/NoValidHPR'
import { getFlag, getUserlessToggles, getUserToggles, toToggleMap } from '@core/toggles/unleash'
import { ToggleProvider } from '@core/toggles/context'
import { spanServerAsync } from '@lib/otel/server'

import { NoPractitionerSession } from './launched-errors'

async function LaunchedLayout({ children }: LayoutProps<'/fhir'>): Promise<ReactElement> {
    const [toggles, hpr] = await spanServerAsync('FhirLayout toggles', async () => {
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
                return <NoValidHPR mode="FHIR" />
        }
    }

    if (!getFlag('PILOT_USER', toggles)) {
        logger.warn(`Non-pilot user has accessed the app, HPR: ${hpr}`)

        redirect('/fhir/error/non-pilot-user')
    }

    return (
        <ToggleProvider toggles={toToggleMap(toggles)}>
            <MultiUserQueryStateToSessionStorageOnInit />
            {children}
            <LoggedOutWarning />
        </ToggleProvider>
    )
}

export default LaunchedLayout
