import { expect, test, Mock, vi } from 'vitest'
import nock from 'nock'

import { SmartClient, SmartStorage } from '../client'

import { mockSmartConfiguration } from './mocks/issuer'
import { expectHas } from './utils/expect'

const createTestStorage = (): SmartStorage & { getFn: Mock; setFn: Mock } => {
    const getFn = vi.fn()
    const setFn = vi.fn()
    return {
        get: getFn,
        set: setFn,
        getFn,
        setFn,
    }
}

test('.launch - should fetch well-known and create a launch URL', async () => {
    const storage = createTestStorage()
    const client = new SmartClient(storage, {
        client_id: 'test-client',
        scope: 'openid fhirUser launch/patient',
        callback_url: 'http://app/callback',
        redirect_url: 'http://app/redirect',
    })

    const smartConfigNock = mockSmartConfiguration()

    const result = await client.launch({
        launch: 'test-launch',
        iss: 'http://fhir-server',
        sessionId: 'test-session',
    })

    expect(smartConfigNock.isDone()).toBe(true)

    /**
     * Should store partial session in the storage
     */
    expect(storage.setFn).toHaveBeenCalledWith('test-session', {
        authorizationEndpoint: 'http://fhir-server/authorize',
        issuer: 'http://fhir-server',
        server: 'http://fhir-server',
        tokenEndpoint: 'http://fhir-server/token',
        codeVerifier: expect.any(String),
        state: expect.any(String),
    })

    /**
     * Should create a redirect URL with PKCE and state
     */
    expectHas(result, 'redirect_url')
    const params = Object.fromEntries(new URL(result.redirect_url).searchParams.entries())
    expect(params).toEqual({
        client_id: 'test-client',
        code_challenge_method: 'S256',
        redirect_uri: 'http://app/callback',
        aud: 'http://fhir-server',
        launch: 'test-launch',
        response_type: 'code',
        scope: 'openid fhirUser launch/patient',
        code_challenge: expect.any(String),
        state: expect.any(String),
    })
})

test('.callback should exchange code for token', async () => {
    const storage = createTestStorage()

    storage.getFn.mockImplementationOnce(() => ({
        server: 'http://fhir-server',
        issuer: 'http://fhir-auth-server',
        authorizationEndpoint: 'http://fhir-auth-server/authorize',
        tokenEndpoint: 'http://fhir-auth-server/token',
        codeVerifier: 'test-code-verifier',
        state: 'some-value',
    }))

    const client = new SmartClient(storage, {
        client_id: 'test-client',
        scope: 'openid fhirUser launch/patient',
        callback_url: 'http://app/callback',
        redirect_url: 'http://app/redirect',
    })

    const tokenResponseNock = nock('http://fhir-auth-server').post('/token').reply(200, {
        access_token: 'test-access-token',
        id_token: 'test-id-token',
        patient: 'c4664cf0-9168-4b6f-8798-93799068552b',
        encounter: '3cdff553-e0ce-4fe0-89ca-8a3b62ca853e',
    })

    const callback = await client.callback({
        sessionId: 'test-session',
        state: 'some-value',
        code: 'køde',
    })

    expect(tokenResponseNock.isDone()).toBe(true)
    expectHas(callback, 'redirect_url')
    expect(callback.redirect_url).toBe('http://app/redirect')
})
