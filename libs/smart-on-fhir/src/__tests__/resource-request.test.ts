import { expect, test } from 'vitest'

import { SmartClient, SmartStorage } from '../client'
import { ReadyClient } from '../client/smart/ReadyClient'
import { CompleteSession } from '../client/storage/schema'

import { createTestIdToken } from './utils/token'
import { expectHas, expectIs } from './utils/expect'
import { mockPractitioner } from './mocks/resources'
import { createTestStorage } from './utils/storage'

const createTestClient = (): [SmartClient, SmartStorage] => {
    const storage = createTestStorage()

    const client = new SmartClient(storage, {
        client_id: 'test-client',
        scope: 'openid fhirUser launch/patient',
        callback_url: 'http://app/callback',
        redirect_url: 'http://app/redirect',
    })

    return [client, storage]
}

const validSession: CompleteSession = {
    // Initial
    server: 'http://fhir-server',
    issuer: 'http://fhir-auth-server',
    authorizationEndpoint: 'http://fhir-auth-server/authorize',
    tokenEndpoint: 'http://fhir-auth-server/token',
    codeVerifier: 'valid-code-verifier',
    state: 'valid-state',
    // Completed
    accessToken: 'valid-access-token',
    idToken: createTestIdToken({ fhirUser: 'Practitioner/ac768edb-d56a-4304-8574-f866c6af4e7e' }),
    patient: 'valid-patient-id',
    encounter: 'valid-encounter-id',
}

test('.request - /Practitioner should fetch and parse Practitioner resource', async () => {
    const [client, storage] = createTestClient()

    await storage.set('test-session', validSession)
    const ready = await client.ready('test-session')

    expectIs(ready, ReadyClient)

    const mock = mockPractitioner('ac768edb-d56a-4304-8574-f866c6af4e7e')

    const practitioner = await ready.request(`/${ready.user.fhirUser}`)

    expect(mock.isDone()).toBe(true)
    expectHas(practitioner, 'resourceType')
    expect(practitioner.resourceType).toBe('Practitioner')
})

test('shorthand for .request Practitioner should fetch and parse Practitioner resource', async () => {
    const [client, storage] = createTestClient()

    await storage.set('test-session', validSession)
    const ready = await client.ready('test-session')

    expectIs(ready, ReadyClient)

    mockPractitioner('ac768edb-d56a-4304-8574-f866c6af4e7e')
    const practitioner = await ready.user.request()

    expectHas(practitioner, 'resourceType')
    expect(practitioner.resourceType).toBe('Practitioner')
})
