import { randomPKCECodeVerifier, randomState } from 'openid-client'
import { teamLogger } from '@navikt/pino-logger/team-log'

import { safeSmartStorage, SafeSmartStorage, SmartStorage, SmartStorageErrors } from '../storage'
import { assertNotBrowser, removeTrailingSlash } from '../utils'
import { logger } from '../logger'
import { CompleteSession, InitialSession } from '../storage/schema'
import { OtelTaxonomy, spanAsync } from '../otel'

import { fetchSmartConfiguration, SmartConfigurationErrors } from './well-known/smart-configuration'
import { tokenExpiresIn, exchangeToken, TokenExchangeErrors, refreshToken } from './launch/token'
import { buildAuthUrl } from './launch/authorization'
import { CallbackError, SessionStorageErrors, SmartClientReadyErrors } from './client-errors'
import { SmartClientConfiguration, SmartClientOptions } from './config'
import { ReadyClient } from './ReadyClient'

/**
 * The smart client is used to handle the launch of the Smart on FHIR application. It requires at the very least:
 * - A asyncronous storage implementation that implements the `SmartStorage` interface, for example Valkey.
 * - A FHIR server to launch towards, where the application is registered.
 *
 * Note: It's the responsibility of the application using this library to limit which issuers are allowed to be launched.
 *       This may part of this applications configuration in the future.
 */
export class SmartClient {
    private readonly _storage: SafeSmartStorage
    private readonly _config: SmartClientConfiguration
    private readonly _options: SmartClientOptions

    constructor(
        storage: SmartStorage | Promise<SmartStorage>,
        config: SmartClientConfiguration,
        options?: SmartClientOptions,
    ) {
        assertNotBrowser()

        this._storage = safeSmartStorage(storage)
        this._config = config
        this._options = options ?? { autoRefresh: false }
    }

    /**
     * **Smart App Launch reference**
     * - EHR Launch: https://build.fhir.org/ig/HL7/smart-app-launch/app-launch.html#launch-app-ehr-launch
     * - Auth URL:   https://build.fhir.org/ig/HL7/smart-app-launch/app-launch.html#obtain-authorization-code
     *
     * The EHR-system provides the issuer URL and the launch context to the application. Initiates a partial session
     * in the session storage.
     *
     * An authorization URL is created using the OAuth 2.0 state parameter and PKCE (Proof Key for Code Exchange).
     *
     * Callee is responsible for redirecting the user to the returned `redirect_url`.
     */
    async launch(params: {
        sessionId: string
        iss: string
        launch: string
    }): Promise<Launch | SmartConfigurationErrors> {
        return spanAsync('launch', async (span) => {
            span.setAttribute(OtelTaxonomy.FhirServer, removeTrailingSlash(params.iss))

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

            // TODO: Debug logging
            if (process.env.NEXT_PUBLIC_RUNTIME_ENV === 'dev-gcp') {
                teamLogger.info(`Authorization URL for launch for ${params.iss}: ${authUrl}`)
            }

            /**
             * PKCE STEP 3
             * Redirect the user to the /authorize endpoint along with the code_challenge
             *
             */
            return { redirect_url: authUrl }
        })
    }

    /**
     * **Smart App Launch reference**
     *  - Callback:       https://build.fhir.org/ig/HL7/smart-app-launch/app-launch.html#response-4
     *  - Token exchange: https://build.fhir.org/ig/HL7/smart-app-launch/app-launch.html#obtain-access-token
     *
     *  The callback is called after the user has been redirected back to the application with code and state.
     *
     *  Completes the partial session created in the `launch` method by exchanging the code for tokens.
     */
    async callback(params: {
        sessionId: string
        code: string
        state: string
    }): Promise<Callback | CallbackError | TokenExchangeErrors | SmartStorageErrors> {
        return spanAsync('callback', async (span) => {
            const initialSession = await this.getInitialSession(params.sessionId)
            if ('error' in initialSession) return initialSession

            span.setAttribute(OtelTaxonomy.FhirServer, initialSession.server)

            if (initialSession.state !== params.state) {
                span.setAttribute(OtelTaxonomy.SessionError, 'STATE_MISMATCH')

                logger.warn(
                    `State mismatch, expected len: ${initialSession.state.length} but got len: ${params.state.length}`,
                )

                return { error: 'INVALID_STATE' }
            }

            logger.info(`Exchanging code for token with issuer ${initialSession.tokenEndpoint}`)

            const tokenResponse = await exchangeToken(params.code, initialSession, this._config)
            if ('error' in tokenResponse) {
                return { error: tokenResponse.error }
            }

            const completeSessionValues: CompleteSession = {
                ...initialSession,
                idToken: tokenResponse.id_token,
                accessToken: tokenResponse.access_token,
                refreshToken: tokenResponse.refresh_token,
                patient: tokenResponse.patient,
                encounter: tokenResponse.encounter,
                webmedPractitioner: tokenResponse.practitioner,
            }

            await this._storage.set(params.sessionId, completeSessionValues)

            return {
                redirect_url: this._config.redirect_url,
            }
        })
    }

    /**
     * **Smart App Launch reference**
     * - Accessing the FHIR API: https://build.fhir.org/ig/HL7/smart-app-launch/app-launch.html#access-fhir-api
     *
     * Once the launch has been completed, a ReadyClient {@link ReadyClient} can be created using the
     * sessionId that was used in the `launch` and `callback` methods.
     */
    async ready(
        sessionId: string | null,
    ): Promise<ReadyClient | ((SmartClientReadyErrors | TokenExchangeErrors) & { validate: ReadyClient['validate'] })> {
        return spanAsync('ready', async (span) => {
            if (sessionId == null) {
                logger.warn(`Tried to .ready SmartClient without active sessionId (was null)`)
                return { error: 'NO_ACTIVE_SESSION', validate: async () => false }
            }

            const session = this._options.autoRefresh
                ? await this.getOrRefresh(sessionId)
                : await this.getCompleteSession(sessionId)

            if ('error' in session) return { error: session.error, validate: async () => false }

            span.setAttribute(OtelTaxonomy.FhirServer, session.server)

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

    private async getCompleteSession(sessionId: string): Promise<CompleteSession | SessionStorageErrors> {
        return spanAsync('get-complete', async (span) => {
            const session = await this._storage.get(sessionId)

            if ('error' in session) {
                span.setAttribute('session.error', session.error)
                logger.error('SmartClient.getSession failed to retrieve session')

                return session
            }

            if (!('refreshToken' in session)) {
                span.setAttribute('session.error', 'INCOMPLETE_SESSION')
                logger.error('SmartClient.getSession failed to retrieve session, session is incomplete')

                return { error: 'INCOMPLETE_SESSION' }
            }

            return session
        })
    }

    private async getInitialSession(sessionId: string): Promise<InitialSession | SmartStorageErrors> {
        return spanAsync('get-partial', async (span) => {
            const existingSession = await this._storage.get(sessionId)
            if ('error' in existingSession) {
                span.setAttribute(OtelTaxonomy.SessionError, existingSession.error)

                logger.error(new Error(`Session not found for sessionId ${sessionId}, was ${existingSession.error}`))

                return { error: existingSession.error }
            }
            return existingSession
        })
    }

    private async getOrRefresh(
        sessionId: string,
    ): Promise<CompleteSession | SessionStorageErrors | TokenExchangeErrors> {
        return spanAsync(
            'get-or-refresh',
            async (span): Promise<CompleteSession | TokenExchangeErrors | SessionStorageErrors> => {
                const session = await this.getCompleteSession(sessionId)
                if ('error' in session) return session

                // Pre-emptively refresh the token if it is about to expire within 5 minutes
                if (tokenExpiresIn(session.accessToken) < 60 * 5) {
                    const refreshResult = await this.refreshSession(sessionId, session)
                    if ('error' in refreshResult) {
                        span.setAttributes({
                            [OtelTaxonomy.SessionError]: refreshResult.error,
                            [OtelTaxonomy.SessionRefreshed]: false,
                        })
                        logger.error('SmartClient.getSession failed to refresh session')

                        // Return potentially expired session, let the rest of the auth flow handle the expiredness.
                        return session
                    }

                    await this._storage.set(sessionId, refreshResult)

                    span.setAttribute(OtelTaxonomy.SessionRefreshed, true)
                    return refreshResult
                }

                span.setAttribute(OtelTaxonomy.SessionRefreshed, false)
                return session
            },
        )
    }

    private async refreshSession(
        sessionId: string,
        session: CompleteSession,
    ): Promise<CompleteSession | TokenExchangeErrors> {
        const refreshResponse = await refreshToken(session, this._config)
        if ('error' in refreshResponse) return refreshResponse

        const refreshedSessionValues: CompleteSession = {
            ...session,
            idToken: refreshResponse.id_token,
            accessToken: refreshResponse.access_token,
            refreshToken: refreshResponse.refresh_token,
            patient: refreshResponse.patient,
            encounter: refreshResponse.encounter,
            webmedPractitioner: refreshResponse.practitioner,
        }

        await this._storage.set(sessionId, refreshedSessionValues)

        return refreshedSessionValues
    }
}

/**
 * A successful launch will end up in a redirect_url for the user to be redirected to.
 *
 * The responsibilty to redirect the user lies with the application using the SmartClient.
 */
export type Launch = {
    redirect_url: string
}

/**
 * A successful callback will end up in a redirect_url for the user to be redirected to, this URL is configured
 * by the application using the SmartClient and is typically part of the app itself.
 */
export type Callback = {
    redirect_url: string
}
