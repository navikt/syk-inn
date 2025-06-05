import { decodeJwt, jwtVerify } from 'jose'
import {
    createFhirBundleSchema,
    FhirBundle,
    FhirCondition,
    FhirConditionSchema,
    FhirDocumentReference,
    FhirDocumentReferenceBase,
    FhirDocumentReferenceBaseSchema,
    FhirEncounter,
    FhirEncounterSchema,
    FhirOrganization,
    FhirOrganizationSchema,
    FhirPatient,
    FhirPatientSchema,
    FhirPractitioner,
    FhirPractitionerSchema,
} from '@navikt/fhir-zod'
import { ZodSchema } from 'zod'

import { CompleteSession } from '../storage/schema'
import { logger } from '../logger'

import { IdToken, IdTokenSchema } from './launch/token-schema'
import { fetchSmartConfiguration, getJwkSet } from './well-known/smart-configuration'
import { getFhir, postFhir } from './resources/fetcher'
import { SmartClient } from './SmartClient'
import { ResourceCreateErrors, ResourceRequestErrors } from './client-errors'

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

    public get fhirUser(): `Practitioner/${string}` {
        if (this._session.webmedPractitioner) {
            return `Practitioner/${this._session.webmedPractitioner}`
        }

        if (this._idToken.fhirUser == null) {
            throw new Error('WebMed hack: No webmedPractitioner and no idToken.fhirUser, what up?')
        }

        // TODO: Probably shouldn't be as'd
        return this._idToken.fhirUser as `Practitioner/${string}`
    }

    public async validate(): Promise<boolean> {
        logger.info(
            `Current users issuer: ${this._session.issuer}, looking for well known at /.well-known/smart-configuration`,
        )

        const smartConfig = await fetchSmartConfiguration(this._session.server)
        if ('error' in smartConfig) {
            logger.error(`Failed to fetch smart configuration: ${smartConfig.error}`)
            return false
        }

        logger.info(`Fetched well known configuration from session.issuer, jwks_uri: ${smartConfig['jwks_uri']}`)
        try {
            await jwtVerify(this._session.accessToken, getJwkSet(smartConfig['jwks_uri']), {
                issuer: this._session.issuer,
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
        logger.info(`Creating DocumentReference with id ${params.payload.id}`)

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
    public async request(resource: `/Organization/${string}`): Promise<FhirOrganization | ResourceRequestErrors>
    public async request(
        resource: `/DocumentReference/${string}`,
    ): Promise<FhirDocumentReferenceBase | ResourceRequestErrors>
    public async request(resource: `/Practitioner/${string}`): Promise<FhirPractitioner | ResourceRequestErrors>
    public async request(
        resource: `/${string}`,
    ): Promise<
        | FhirOrganization
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
                logger.error(`Request to get ${resource} failed with text: ${text}`)
            } else if (response.headers.get('Content-Type')?.includes('application/json')) {
                const json = await response.json()
                logger.error(`Request to get ${resource} failed with json: ${JSON.stringify(json)}`)
            }

            logger.error(
                new Error(
                    `Request to get ${resource} failed, ${response.url} responded with ${response.status} ${response.statusText}`,
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
    } else if (resource.startsWith('/Organization')) {
        return FhirOrganizationSchema
    } else {
        throw new Error(`Unknown resource type (or not implemented): ${resource}`)
    }
}
