import { calculatePKCECodeChallenge } from 'openid-client'

import { InitialSession } from '../../storage/schema'
import { SmartClientConfiguration } from '../SmartClient'

type AuthUrlOpts = Pick<InitialSession, 'issuer' | 'state' | 'codeVerifier' | 'authorizationEndpoint'> & {
    launch: string
}

export async function buildAuthUrl(opts: AuthUrlOpts, config: SmartClientConfiguration): Promise<string> {
    /**
     * PKCE STEP 2
     * Generate a code_challenge from the code_verifier in step 1
     */
    const code_challenge = await calculatePKCECodeChallenge(opts.codeVerifier)
    const params = new URLSearchParams({
        response_type: 'code',
        client_id: config.client_id,
        scope: config.scope,
        redirect_uri: config.callback_url,
        aud: opts.issuer,
        launch: opts.launch,
        state: opts.state,
        code_challenge: code_challenge,
        code_challenge_method: 'S256',
    })
    return `${opts.authorizationEndpoint}?${params.toString()}`
}
