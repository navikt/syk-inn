import { logger } from '@navikt/next-logger'

import { MockSykInnApi } from './MockSykInnApi'
import { scenarios, Scenarios } from './scenarios/scenarios'

/**
 * Keeps track of the mock database for each session by session id. Should only have a single instance per server.
 */
class MockSessionStore {
    private _apiState: Record<string, MockSykInnApi> = {}

    get(sessionId: string): MockSykInnApi {
        if (this._apiState[sessionId] == null) {
            logger.info(`No session found for ${sessionId}, creating a new record with a normal scenario`)
            this._apiState[sessionId] = new MockSykInnApi(scenarios.normal.scenario())
        }

        return this._apiState[sessionId]
    }

    set(sessionId: string, scenario: Scenarios): void {
        logger.info(`Setting scenario ${scenario} for session ${sessionId}`)
        this._apiState[sessionId] = new MockSykInnApi(scenarios[scenario].scenario())
    }
}

export default MockSessionStore
