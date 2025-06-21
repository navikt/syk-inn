import nock, { Scope } from 'nock'

import { AUTH_SERVER } from './common'

type TokenExchangeValues = {
    client_id: string
    code: string
    code_verifier: string
    redirect_uri: string
}

export function mockTokenExchange(expectedBody: TokenExchangeValues): Scope {
    return nock(AUTH_SERVER)
        .post('/token', {
            ...expectedBody,
            grant_type: 'authorization_code',
        })
        .reply(200, {
            access_token: 'test-access-token',
            id_token: 'test-id-token',
            patient: 'c4664cf0-9168-4b6f-8798-93799068552b',
            encounter: '3cdff553-e0ce-4fe0-89ca-8a3b62ca853e',
        })
}
