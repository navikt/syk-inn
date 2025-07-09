import { notFound, redirect, RedirectType } from 'next/navigation'
import { ReactElement } from 'react'

import { getSessionId } from '@fhir/smart/session'

import { overwriteScenarioForSession, shouldUseMockEngine } from '../../../../data-layer/mock-engine'
import { Scenarios, scenarios } from '../../../../data-layer/mock-engine/scenarios/scenarios'

type RouteParams = {
    params: Promise<{ scenario: string }>
    searchParams: Promise<{ returnTo?: string }>
}

async function SetScenarioPage({ params, searchParams }: RouteParams): Promise<ReactElement> {
    if (!shouldUseMockEngine()) return notFound()

    const scenario = (await params).scenario
    const returnTo = (await searchParams).returnTo || '/'

    const sessionId = await getSessionId()
    if (sessionId == null) {
        return <div>No session ID, is middleware not working?</div>
    }

    if (!Object.keys(scenarios).includes(scenario)) {
        return (
            <div>{`Scenario "${scenario}" not found. Available scenarios: ${Object.keys(scenarios).join(', ')}`}</div>
        )
    }

    overwriteScenarioForSession(sessionId, scenario as Scenarios)

    redirect(returnTo, RedirectType.replace)
}

export default SetScenarioPage
