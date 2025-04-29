import { randomPKCECodeVerifier, randomState } from 'openid-client'
import { decodeJwt, jwtVerify } from 'jose'
import { ZodSchema } from 'zod'
import {
    FhirPractitioner,
    FhirPractitionerSchema,
    FhirDocumentReference,
    FhirDocumentReferenceBase,
    FhirDocumentReferenceBaseSchema,
    FhirPatient,
    FhirEncounter,
    FhirCondition,
    FhirBundle,
    FhirPatientSchema,
    FhirEncounterSchema,
    FhirConditionSchema,
    createFhirBundleSchema,
} from '@navikt/fhir-zod'

import { SmartStorage, safeSmartStorage, SafeSmartStorage, SmartStorageErrors } from '../storage'
import { assertNotBrowser } from '../utils'
import { logger } from '../logger'
import { CompleteSession, InitialSession } from '../storage/schema'
import { IdToken, IdTokenSchema } from '../schema/TokenResponse'

import { fetchSmartConfiguration, getJwkSet, SmartConfigurationErrors } from './smart-configuration'
import { buildAuthUrl } from './launch/authorization'
import { fetchTokenExchange, TokenExchangeErrors } from './launch/token'
import { getFhir, postFhir } from './fetcher'

export type Launch = {
    redirect_url: string
}

export type LaunchError = {
    error: 'INVALID_ISSUER'
}

export type Callback = {
    redirect_url: string
}

export type CallbackError = {
    error: 'INVALID_STATE'
}

export type SmartClientReadyErrors = {
    error: 'NO_ACTIVE_SESSION' | 'INCOMPLETE_SESSION' | 'INVALID_ID_TOKEN'
}

export type ResourceCreateErrors = {
    error: 'CREATE_FAILED_NON_OK_RESPONSE' | 'CREATE_FAILED_INVALID_RESPONSE'
}

export type ResourceRequestErrors = {
    error: 'REQUEST_FAILED_NON_OK_RESPONSE' | 'REQUEST_FAILED_INVALID_RESPONSE' | 'REQUEST_FAILED_RESOURCE_NOT_FOUND'
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
        issuer: string
        launch: string
    }): Promise<Launch | LaunchError | SmartConfigurationErrors> {
        const smartConfig = await fetchSmartConfiguration(params.issuer)
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
    }

    async callback(params: {
        sessionId: string
        code: string
        state: string
    }): Promise<Callback | CallbackError | TokenExchangeErrors | SmartStorageErrors> {
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
    }

    async ready(sessionId: string | null): Promise<ReadyClient | SmartClientReadyErrors> {
        if (sessionId == null) return { error: 'NO_ACTIVE_SESSION' }

        const session = await this._storage.get(sessionId)

        if (session == null) return { error: 'NO_ACTIVE_SESSION' }
        if (!('idToken' in session)) return { error: 'INCOMPLETE_SESSION' }

        try {
            return new ReadyClient(this, session)
        } catch (e) {
            return { error: 'INVALID_ID_TOKEN' }
        }
    }
}

export class ReadyClient {
    private readonly _client: SmartClient
    private readonly _session: CompleteSession
    private readonly _idToken: IdToken

    constructor(client: SmartClient, session: CompleteSession) {
        this._client = client
        this._session = session
        this._idToken = IdTokenSchema.parse(decodeJwt(session.idToken))
    }

    public get patient(): string {
        return this._session.patient
    }

    public get encounter(): string {
        return this._session.encounter
    }

    public get fhirUser(): string {
        return this._idToken.fhirUser
    }

    public async verifyToken(): Promise<boolean> {
        logger.info(
            `Current users issuer: ${this._session.issuer}, looking for well known at /.well-known/smart-configuration`,
        )

        const smartConfig = await fetchSmartConfiguration(this._session.issuer)
        if ('error' in smartConfig) {
            logger.error(`Failed to fetch smart configuration: ${smartConfig.error}`)
            return false
        }

        logger.info(`Fetched well known configuration from session.issuer, jwks_uri: ${smartConfig['jwks_uri']}`)
        try {
            await jwtVerify(this._session.accessToken, getJwkSet(smartConfig['jwks_uri']), {
                issuer: [
                    this._session.issuer,
                    // TODO: token can be issued by a differen auth server than the smart launched issuer
                    // ...knownIssuers[session.issuer].issuers
                ],
                algorithms: ['RS256'],
            })

            logger.info('Token verified!')
            return true
        } catch (e) {
            logger.error(new Error(`Token validation failed, ${(e as { code: string })?.code ?? 'UNKNOWN'}`))

            return false
        }
    }

    public async create(
        resource: '/DocumentReference',
        params: { payload: Partial<FhirDocumentReference> },
    ): Promise<FhirDocumentReferenceBase | ResourceCreateErrors> {
        const response = await postFhir({ session: this._session, path: resource }, { payload: params.payload })

        if (!response.ok) {
            if (response.headers.get('Content-Type')?.includes('text/plain')) {
                const text = await response.text()
                logger.error(`Request to create DocumentReference failed with text: ${text}`)
            } else if (response.headers.get('Content-Type')?.includes('application/json')) {
                const json = await response.json()
                logger.error(`Request to create DocumentReference failed with json: ${JSON.stringify(json)}`)
            }

            logger.error(
                new Error(
                    `Request to create DocumentReference failed, ${response.url} responded with ${response.status} ${response.statusText}`,
                ),
            )

            return { error: 'CREATE_FAILED_NON_OK_RESPONSE' }
        }

        const result = await response.json()

        // TODO: Don't hardcode the schema
        const parsed = FhirDocumentReferenceBaseSchema.safeParse(result)
        if (!parsed.success) {
            logger.error(new Error('Failed to parse DocumentReference', { cause: parsed.error }))
            return { error: 'CREATE_FAILED_INVALID_RESPONSE' }
        }

        return parsed.data
    }

    public async request(resource: `/Condition?${string}`): Promise<FhirBundle<FhirCondition> | ResourceRequestErrors>
    public async request(resource: `/Encounter/${string}`): Promise<FhirEncounter | ResourceRequestErrors>
    public async request(resource: `/Patient/${string}`): Promise<FhirPatient | ResourceRequestErrors>
    public async request(
        resource: `/DocumentReference/${string}`,
    ): Promise<FhirDocumentReferenceBase | ResourceRequestErrors>
    public async request(resource: `/Practitioner/${string}`): Promise<FhirPractitioner | ResourceRequestErrors>
    public async request(
        resource: `/${string}`,
    ): Promise<
        | FhirPractitioner
        | FhirDocumentReferenceBase
        | FhirPatient
        | FhirEncounter
        | FhirBundle<FhirCondition>
        | ResourceRequestErrors
    > {
        const response = await getFhir({ session: this._session, path: resource })

        if (!response.ok) {
            if (response.headers.get('Content-Type')?.includes('text/plain')) {
                const text = await response.text()
                logger.error(`Request to get Practitioner failed with text: ${text}`)
            } else if (response.headers.get('Content-Type')?.includes('application/json')) {
                const json = await response.json()
                logger.error(`Request to get Practitioner failed with json: ${JSON.stringify(json)}`)
            }

            logger.error(
                new Error(
                    `Request to get Practitioner failed, ${response.url} responded with ${response.status} ${response.statusText}`,
                ),
            )

            if (response.status === 404) {
                return { error: 'REQUEST_FAILED_RESOURCE_NOT_FOUND' }
            }

            return { error: 'REQUEST_FAILED_NON_OK_RESPONSE' }
        }

        const result = await response.json()
        const resourceSchema = resourceToSchema(resource)
        const parsed = resourceSchema.safeParse(result)
        if (!parsed.success) {
            logger.error(new Error(`Failed to parse ${resource}`, { cause: parsed.error }))
            return { error: 'REQUEST_FAILED_INVALID_RESPONSE' }
        }

        return parsed.data
    }
}

function resourceToSchema(resource: `/${string}`): ZodSchema {
    if (resource.startsWith('/Practitioner/')) {
        return FhirPractitionerSchema
    } else if (resource.startsWith('/DocumentReference/')) {
        return FhirDocumentReferenceBaseSchema
    } else if (resource.startsWith('/Patient/')) {
        return FhirPatientSchema
    } else if (resource.startsWith('/Encounter/')) {
        return FhirEncounterSchema
    } else if (resource.startsWith('/Condition?')) {
        return createFhirBundleSchema(FhirConditionSchema)
    } else {
        throw new Error(`Unknown resource type (or not implemented): ${resource}`)
    }
}
