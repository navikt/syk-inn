import { expect, test } from 'vitest'
import { calculatePKCECodeChallenge } from 'openid-client'

import { ReadyClient, SmartClient } from '../client'
import { CompleteSession, InitialSession } from '../client/storage/schema'

import { createTestStorage } from './utils/storage'
import { FHIR_SERVER } from './mocks/common'
import { expectHas, expectIs, searchParamsToObject } from './utils/expect'
import { mockSmartConfiguration } from './mocks/issuer'
import { mockTokenExchange } from './mocks/auth'

test('pkce verification should be correct', async () => {
    const sessionId = '689fe0f1-2304-45e9-bb45-bb1b8dac2379'
    const storage = createTestStorage()
    const client = new SmartClient(storage, {
        client_id: 'test-client',
        scope: 'openid fhirUser launch/patient',
        callback_url: 'http://app/callback',
        redirect_url: 'http://app/redirect',
    })

    /**
     * User launches app, generates auth URL
     */
    mockSmartConfiguration()
    const result = await client.launch({
        sessionId: sessionId,
        iss: FHIR_SERVER,
        launch: 'foo-bar-launch',
    })

    /**
     * Verify that the /authorize params are correct
     */
    expectHas(result, 'redirect_url')
    const params = searchParamsToObject(result.redirect_url)

    const { codeVerifier } = (await storage.get(sessionId)) as InitialSession
    const expectedCodeChallenge = await calculatePKCECodeChallenge(codeVerifier)
    expect(params.code_challenge).toBe(expectedCodeChallenge)

    /**
     * User is returned, and wants to exchange the code for tokens
     */
    mockTokenExchange({
        /**
         * Code verifier generated in the launch step
         */
        code_verifier: codeVerifier,
        client_id: 'test-client',
        code: 'test-code',
        redirect_uri: 'http://app/redirect',
    })
    const callback = await client.callback({
        sessionId,
        code: 'test-code',
        state: params.state,
    })

    /**
     * Launch is complete and session is complete
     */
    expectHas(callback, 'redirect_url')
    const session = (await storage.get(sessionId)) as CompleteSession
    expect(session).toHaveProperty('accessToken')
    expect(session).toHaveProperty('idToken')
    expect(session).toHaveProperty('patient')
    expect(session).toHaveProperty('encounter')

    /**
     * We're able to ready-up a ReadyClient with the session
     */
    const ready = await client.ready(sessionId)
    expectIs(ready, ReadyClient)

    expect(ready.fhirUser).toEqual('Practitioner/71503542-c4f5-4f11-a5a5-6633c139d0d4')
    expect(ready.patient).toEqual('c4664cf0-9168-4b6f-8798-93799068552b')
    expect(ready.encounter).toEqual('3cdff553-e0ce-4fe0-89ca-8a3b62ca853e')
})
