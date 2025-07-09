import { redirect, RedirectType } from 'next/navigation'

import { getSessionId } from '@fhir/smart/session'

import { mockSessionStore } from '../../../../data-layer/mock-engine'
import { Scenarios, scenarios } from '../../../../data-layer/mock-engine/scenarios/scenarios'

type RouteParams = { params: Promise<{ scenario: string }> }

export async function GET(request: Request, { params }: RouteParams): Promise<Response> {
    const scenario = (await params).scenario
    const returnTo = new URL(request.url).searchParams.get('returnTo') || '/'

    const sessionId = await getSessionId()
    if (sessionId == null) {
        return new Response('Session ID is not set. Cannot access mock engine.', {
            status: 500,
            headers: { 'Content-Type': 'text/plain' },
        })
    }

    if (!Object.keys(scenarios).includes(scenario)) {
        return new Response(`Scenario ${scenario} not found`, {
            status: 404,
            headers: { 'Content-Type': 'text/plain' },
        })
    }

    const sessionStore = mockSessionStore()
    sessionStore.set(sessionId, scenario as Scenarios)

    redirect(returnTo, RedirectType.replace)
}
