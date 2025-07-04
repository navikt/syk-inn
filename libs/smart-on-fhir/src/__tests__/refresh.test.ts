import { expect, test } from 'vitest'
import nock from 'nock'

import { CompleteSession } from '../client/storage/schema'
import { ReadyClient } from '../client'

import { expectIs } from './utils/expect'
import { createTestAccessToken, createTestIdToken } from './utils/token'
import { createLaunchableSmartClient } from './utils/client'
import { mockTokenRefresh } from './mocks/auth'
import { AUTH_SERVER, FHIR_SERVER } from './mocks/common'

const validSession: CompleteSession = {
    // Initial
    server: FHIR_SERVER,
    issuer: AUTH_SERVER,
    authorizationEndpoint: `${AUTH_SERVER}/authorize`,
    tokenEndpoint: `${AUTH_SERVER}/token`,
    codeVerifier: 'valid-code-verifier',
    state: 'valid-state',
    // Completed
    accessToken: createTestAccessToken(3600),
    idToken: createTestIdToken({ fhirUser: 'Practitioner/ac768edb-d56a-4304-8574-f866c6af4e7e' }),
    refreshToken: 'valid-refresh-token',
    patient: 'valid-patient-id',
    encounter: 'valid-encounter-id',
}

test('.ready - should not refresh token when expiry is more than 5 minutes', async () => {
    const [client] = await createLaunchableSmartClient(
        {
            ...validSession,
            accessToken: createTestAccessToken(60 * 6), // 6 minutes
        },
        { autoRefresh: true },
    )

    const tokenMock = nock(AUTH_SERVER).post('/token').replyWithError('This endpoint should not be called')

    const ready = await client.ready()

    expectIs(ready, ReadyClient)

    expect(tokenMock.pendingMocks()).toContain(`POST ${AUTH_SERVER}:80/token`)
})

test('.ready - should refresh token when expiry is less than 5 minutes', async () => {
    const [client] = await createLaunchableSmartClient(
        {
            ...validSession,
            accessToken: createTestAccessToken(60 * 4.99),
        },
        { autoRefresh: true },
    )

    const tokenMock = mockTokenRefresh({
        client_id: 'test-client',
        refresh_token: 'valid-refresh-token',
    })

    const ready = await client.ready()

    expectIs(ready, ReadyClient)

    expect(tokenMock.isDone()).toBe(true)
})

test('.ready - should refresh token when expiry is long ago', async () => {
    const [client] = await createLaunchableSmartClient(
        {
            ...validSession,
            accessToken: createTestAccessToken(-60 * 10), // 10 minutes ago
        },
        { autoRefresh: true },
    )

    const tokenMock = mockTokenRefresh({
        client_id: 'test-client',
        refresh_token: 'valid-refresh-token',
    })

    const ready = await client.ready()

    expectIs(ready, ReadyClient)

    expect(tokenMock.isDone()).toBe(true)
})
