import { lazyNextleton } from 'nextleton'

import { getSessionId } from '@fhir/smart/session'
import { getServerEnv, isE2E, isLocalOrDemo } from '@utils/env'

import MockSessionStore from './MockSessionStore'
import { MockSykInnApi } from './MockSykInnApi'

const sessionRecord = lazyNextleton('mockarino-1', () => new MockSessionStore())

export function mockSessionStore(): MockSessionStore {
    return sessionRecord()
}

export async function mockEngineForSession(): Promise<MockSykInnApi> {
    const sessionId = await getSessionId()
    if (sessionId == null) {
        throw new Error('Session ID is not set. Cannot access mock engine.')
    }
    return sessionRecord().get(sessionId)
}

export function shouldUseMockEngine(): boolean {
    return (isLocalOrDemo || isE2E) && !getServerEnv().useLocalSykInnApi
}
