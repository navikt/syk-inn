import { lazyNextleton } from 'nextleton'

import { getSessionId } from '@fhir/smart/session'
import { getServerEnv, isE2E, isLocalOrDemo } from '@utils/env'

import MockSessionStore from './MockSessionStore'
import { MockEngine } from './MockEngine'
import { Scenarios } from './scenarios/scenarios'

const sessionRecord = lazyNextleton('mockarino-1', () => new MockSessionStore())

export function overwriteScenarioForSession(sessionId: string, scenario: Scenarios): void {
    sessionRecord().set(sessionId, scenario)
}

export async function mockEngineForSession(): Promise<MockEngine> {
    const sessionId = await getSessionId()
    if (sessionId == null) {
        throw new Error('Session ID is not set. Cannot access mock engine.')
    }
    const mockEngine = sessionRecord().get(sessionId)
    if (!mockEngine.isInitialized) {
        await mockEngine.init()
    }

    return mockEngine
}

export function shouldUseMockEngine(): boolean {
    return (isLocalOrDemo || isE2E) && !getServerEnv().useLocalSykInnApi
}
