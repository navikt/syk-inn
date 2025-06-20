import { randomPKCECodeVerifier, randomState } from 'openid-client'

import { safeSmartStorage, SafeSmartStorage, SmartStorage, SmartStorageErrors } from '../storage'
import { assertNotBrowser, removeTrailingSlash } from '../utils'
import { logger } from '../logger'
import { CompleteSession, InitialSession } from '../storage/schema'
import { spanAsync } from '../otel'

import { fetchSmartConfiguration, SmartConfigurationErrors } from './well-known/smart-configuration'
import { fetchTokenExchange, TokenExchangeErrors } from './launch/token'
import { buildAuthUrl } from './launch/authorization'
import { CallbackError, SmartClientReadyErrors } from './client-errors'
import { ReadyClient } from './ReadyClient'

export type Launch = {
    redirect_url: string
}

export type LaunchError = {
    error: 'INVALID_ISSUER'
}

export type Callback = {
    redirect_url: string
}

export type SmartClientConfiguration = {
    client_id: string
    scope: string
    callback_url: string
    redirect_url: string
}

export class SmartClient {
    private readonly _storage: SafeSmartStorage
    private readonly _config: SmartClientConfiguration

    constructor(storage: SmartStorage | Promise<SmartStorage>, config: SmartClientConfiguration) {
        assertNotBrowser()

        this._storage = safeSmartStorage(storage)
        this._config = config
    }

    async launch(params: {
        sessionId: string
        iss: string
        launch: string
    }): Promise<Launch | LaunchError | SmartConfigurationErrors> {
        return spanAsync('launch', async () => {
            const smartConfig = await fetchSmartConfiguration(params.iss)
            if ('error' in smartConfig) {
                return { error: smartConfig.error }
            }

            /**
             * PKCE STEP 1
             * Create a cryptographically-random code_verifier
             */
            const codeVerifier = randomPKCECodeVerifier()
            const state = randomState()
            const initialSessionPayload: InitialSession = {
                server: removeTrailingSlash(params.iss),
                issuer: smartConfig.issuer,
                authorizationEndpoint: smartConfig.authorization_endpoint,
                tokenEndpoint: smartConfig.token_endpoint,
                codeVerifier: codeVerifier,
                state: state,
            }

            await this._storage.set(params.sessionId, initialSessionPayload)

            const authUrl = await buildAuthUrl(
                {
                    ...initialSessionPayload,
                    launch: params.launch,
                },
                this._config,
            )

            /**
             * PKCE STEP 3
             * Redirect the user to the /authorize endpoint along with the code_challenge
             *
             */
            return { redirect_url: authUrl }
        })
    }

    async callback(params: {
        sessionId: string
        code: string
        state: string
    }): Promise<Callback | CallbackError | TokenExchangeErrors | SmartStorageErrors> {
        return spanAsync('callback', async () => {
            const existingSession = await this._storage.get(params.sessionId)
            if ('error' in existingSession) {
                logger.error(`Session not found for sessionId ${params.sessionId}`, { cause: existingSession })
                return { error: existingSession.error }
            }

            if (existingSession.state !== params.state) {
                logger.warn(
                    `State mismatch, expected len: ${existingSession.state.length} but got len: ${params.state.length}`,
                )

                return { error: 'INVALID_STATE' }
            }

            logger.info(`Exchanging code for token with issuer ${existingSession.tokenEndpoint}`)

            const tokenResponse = await fetchTokenExchange(params.code, this._config.callback_url, existingSession)
            if ('error' in tokenResponse) {
                return { error: tokenResponse.error }
            }

            const completeSessionValues: CompleteSession = {
                ...existingSession,
                idToken: tokenResponse.id_token,
                accessToken: tokenResponse.access_token,
                patient: tokenResponse.patient,
                encounter: tokenResponse.encounter,
            }

            await this._storage.set(params.sessionId, completeSessionValues)

            return {
                redirect_url: this._config.redirect_url,
            }
        })
    }

    async ready(
        sessionId: string | null,
    ): Promise<ReadyClient | (SmartClientReadyErrors & { validate: ReadyClient['validate'] })> {
        return spanAsync('ready', async () => {
            if (sessionId == null) {
                logger.warn(`Tried to .ready SmartClient without active sessionId (was null)`)
                return { error: 'NO_ACTIVE_SESSION', validate: async () => false }
            }

            const session = await this._storage.get(sessionId)

            if ('error' in session) {
                switch (session.error) {
                    case 'NO_STATE':
                        // User has been logged out, no need for spammy logging
                        return { error: 'NO_ACTIVE_SESSION', validate: async () => false }
                    case 'BROKEN_SESSION_STATE':
                        // Session is broken, safeStorage already logged the error
                        return { error: 'INCOMPLETE_SESSION', validate: async () => false }
                }
            }

            if (!('idToken' in session)) {
                logger.warn(`Tried to .ready SmartClient, but session was inpcomplete for id "${sessionId}"`)
                return { error: 'INCOMPLETE_SESSION', validate: async () => false }
            }

            try {
                return new ReadyClient(this, session)
            } catch (error) {
                logger.error(
                    new Error(`Tried to .ready SmartClient, ReadyClient failed to instantiate for id "${sessionId}"`, {
                        cause: error,
                    }),
                )
                return { error: 'INVALID_ID_TOKEN', validate: async () => false }
            }
        })
    }
}
