import { ReadyClient, SmartClient, SmartClientOptions, SmartStorage } from '../../client'
import { CompleteSession } from '../../client/storage/schema'

import { createTestStorage } from './storage'
import { expectIs } from './expect'

export const TEST_SESSION_ID = 'test-session'

export const createTestClient = (options?: SmartClientOptions): [SmartClient, SmartStorage] => {
    const storage = createTestStorage()

    const client = new SmartClient(
        TEST_SESSION_ID,
        storage,
        {
            client_id: 'test-client',
            scope: 'openid fhirUser launch/patient',
            callback_url: 'http://app/callback',
            redirect_url: 'http://app/redirect',
        },
        options,
    )

    return [client, storage]
}

export async function createLaunchableSmartClient(
    session: CompleteSession,
    options?: SmartClientOptions,
): Promise<[SmartClient, SmartStorage]> {
    const [client, storage] = createTestClient(options)

    await storage.set('test-session', session)

    expectIs(client, SmartClient)

    return [client, storage]
}

export async function createLaunchedReadyClient(
    session: CompleteSession,
    options?: SmartClientOptions,
): Promise<[ReadyClient, SmartStorage]> {
    const [client, storage] = createTestClient(options)

    await storage.set(TEST_SESSION_ID, session)
    const ready = await client.ready()

    expectIs(ready, ReadyClient)

    return [ready, storage]
}
