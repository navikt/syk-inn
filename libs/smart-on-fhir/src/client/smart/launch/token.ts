import { InitialSession } from '../../storage/schema'
import { logger } from '../../logger'

import { TokenResponseSchema, TokenResponse } from './token-schema'

export type TokenExchangeErrors = {
    error: 'TOKEN_EXCHANGE_FAILED' | 'TOKEN_EXCHANGE_INVALID_BODY' | 'UNKNOWN_ERROR'
}

export async function fetchTokenExchange(
    code: string,
    redirect_uri: string,
    session: InitialSession,
): Promise<TokenResponse | TokenExchangeErrors> {
    /**
     * PKCE STEP 5
     * Send code and the code_verifier (created in step 1) to the authorization servers /oauth/token endpoint.
     */
    const response = await fetch(session.tokenEndpoint, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            client_id: 'syk-inn',
            grant_type: 'authorization_code',
            code: code,
            code_verifier: session.codeVerifier,
            redirect_uri: redirect_uri,
        }),
    })

    /**
     * PKCE STEP 6
     * Authorization server verifies the code_challenge and code_verifier.
     * Upon successful verification the authorization server issues id_token, access_token and (optional) refresh_token.
     */
    if (!response.ok) {
        logger.error(`Token exchange failed, token_endpoint responed with ${response.status} ${response.statusText}`)
        if (response.headers.get('Content-Type')?.includes('text/plain')) {
            const text = await response.text()
            logger.error(`Token exchange failed with text: ${text}`)
        } else if (response.headers.get('Content-Type')?.includes('application/json')) {
            const json = await response.json()
            logger.error(`Token exchange failed with json: ${JSON.stringify(json)}`)
        }

        return { error: 'TOKEN_EXCHANGE_FAILED' }
    }

    const result: unknown = await response.json()
    const parsedTokenResponse = TokenResponseSchema.safeParse(result)

    if (!parsedTokenResponse.success) {
        logger.error(
            new Error(`Issuer/token_endpoint ${session.tokenEndpoint} responded with weird token response`, {
                cause: parsedTokenResponse.error,
            }),
        )

        return { error: 'TOKEN_EXCHANGE_INVALID_BODY' }
    }

    return parsedTokenResponse.data
}
