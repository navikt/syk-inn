import { expect, test } from 'vitest'

import { SmartClient, ReadyClient, SmartStorage } from '../client'
import { CompleteSession } from '../client/storage/schema'

import { createTestIdToken } from './utils/token'
import { expectHas, expectIs } from './utils/expect'
import { mockEncounter, mockPatient, mockPractitioner } from './mocks/resources'
import { createTestStorage } from './utils/storage'
import { mockCreateDocumentReference } from './mocks/create-resources'

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

test('SmartClient should be properly initiated with Patient, Encounter and User', async () => {
    const [ready] = await createLaunchedReadyClient()

    expect(ready.patient.type).toEqual('Patient')
    expect(ready.patient.reference).toEqual('Patient/valid-patient-id')
    expect(ready.patient.id).toEqual('valid-patient-id')

    expect(ready.encounter.type).toEqual('Encounter')
    expect(ready.encounter.reference).toEqual('Encounter/valid-encounter-id')
    expect(ready.encounter.id).toEqual('valid-encounter-id')

    expect(ready.user.fhirUser).toEqual('Practitioner/ac768edb-d56a-4304-8574-f866c6af4e7e')
})

test('SmartClient.request - /Practitioner should fetch and parse Practitioner resource', async () => {
    const [ready] = await createLaunchedReadyClient()

    const mock = mockPractitioner('ac768edb-d56a-4304-8574-f866c6af4e7e')

    const practitioner = await ready.request(ready.user.fhirUser)

    expect(mock.isDone()).toBe(true)
    expectHas(practitioner, 'resourceType')
    expect(practitioner.resourceType).toBe('Practitioner')
})

test('SmartClient.create - /DocumentReference should POST and parse DocumentReference resource', async () => {
    const [ready] = await createLaunchedReadyClient()

    const mock = mockCreateDocumentReference({ resourceType: 'DocumentReference' })
    const practitioner = await ready.create('DocumentReference', {
        // Payload is contrivedly small for test
        payload: { resourceType: 'DocumentReference' },
    })

    expect(mock.isDone()).toBe(true)
    expectHas(practitioner, 'resourceType')
    expect(practitioner.resourceType).toBe('DocumentReference')
})

test('shorthand for .request Practitioner should fetch and parse Practitioner resource', async () => {
    const [ready] = await createLaunchedReadyClient()

    mockPractitioner('ac768edb-d56a-4304-8574-f866c6af4e7e')
    const practitioner = await ready.user.request()

    expectHas(practitioner, 'resourceType')
    expect(practitioner.resourceType).toBe('Practitioner')
})

test('shorthand for .request Encounter should fetch and parse Encounter resource', async () => {
    const [ready] = await createLaunchedReadyClient()

    mockEncounter('valid-encounter-id')
    const encounter = await ready.encounter.request()

    expectHas(encounter, 'resourceType')
    expect(encounter.resourceType).toBe('Encounter')
})

test('shorthand for .request Patient should fetch and parse Patient resource', async () => {
    const [ready] = await createLaunchedReadyClient()

    mockPatient('valid-patient-id')
    const encounter = await ready.patient.request()

    expectHas(encounter, 'resourceType')
    expect(encounter.resourceType).toBe('Patient')
})

async function createLaunchedReadyClient(): Promise<[ReadyClient, SmartStorage]> {
    const [client, storage] = createTestClient()

    await storage.set('test-session', validSession)
    const ready = await client.ready('test-session')

    expectIs(ready, ReadyClient)

    return [ready, storage]
}
