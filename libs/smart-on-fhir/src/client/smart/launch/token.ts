import { InitialSession } from '../../storage/schema'
import { logger } from '../../logger'
import { OtelTaxonomy, spanAsync } from '../../otel'
import { getResponseError } from '../../utils'
import { SmartClientConfiguration } from '../SmartClient'

import { TokenResponseSchema, TokenResponse } from './token-schema'

export type TokenExchangeErrors = {
    error: 'TOKEN_EXCHANGE_FAILED' | 'TOKEN_EXCHANGE_INVALID_BODY' | 'UNKNOWN_ERROR'
}

export async function fetchTokenExchange(
    code: string,
    config: SmartClientConfiguration,
    session: InitialSession,
): Promise<TokenResponse | TokenExchangeErrors> {
    return spanAsync('token-exchange', async (span) => {
        span.setAttribute(OtelTaxonomy.FhirServer, session.server)

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
                client_id: config.client_id,
                grant_type: 'authorization_code',
                code: code,
                code_verifier: session.codeVerifier,
                redirect_uri: config.redirect_url,
            }),
        })

        /**
         * PKCE STEP 6
         * Authorization server verifies the code_challenge and code_verifier.
         * Upon successful verification the authorization server issues id_token, access_token and (optional) refresh_token.
         */
        if (!response.ok) {
            const responseError = await getResponseError(response)
            logger.error(
                `Token exchange failed, token_endpoint responed with ${response.status} ${response.statusText}, server says: ${responseError}`,
            )

            span.recordException(
                new Error(
                    `Token exchange failed, token_endpoint responed with ${response.status} ${response.statusText}`,
                ),
            )

            return { error: 'TOKEN_EXCHANGE_FAILED' }
        }

        const result: unknown = await response.json()
        const parsedTokenResponse = TokenResponseSchema.safeParse(result)

        if (!parsedTokenResponse.success) {
            const exception = new Error(
                `Issuer/token_endpoint ${session.tokenEndpoint} responded with weird token response`,
                {
                    cause: parsedTokenResponse.error,
                },
            )

            logger.error(exception)
            span.recordException(exception)

            return { error: 'TOKEN_EXCHANGE_INVALID_BODY' }
        }

        return parsedTokenResponse.data
    })
}
