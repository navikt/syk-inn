import * as z from 'zod/v4'
import { decodeJwt, jwtVerify } from 'jose'
import {
    createFhirBundleSchema,
    FhirDocumentReference,
    FhirDocumentReferenceBase,
    FhirConditionSchema,
    FhirDocumentReferenceBaseSchema,
    FhirEncounterSchema,
    FhirOrganizationSchema,
    FhirPatientSchema,
    FhirPractitionerSchema,
} from '@navikt/fhir-zod'

import { CompleteSession } from '../storage/schema'
import { logger } from '../logger'
import { spanAsync } from '../otel'
import { getResponseError } from '../utils'

import { IdToken, IdTokenSchema } from './launch/token-schema'
import { fetchSmartConfiguration, getJwkSet } from './well-known/smart-configuration'
import { getFhir, postFhir } from './resources/fetcher'
import { SmartClient } from './SmartClient'
import { ResourceCreateErrors, ResourceRequestErrors } from './client-errors'
import { KnownPaths, ResponseFor } from './resources/resource-map'

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

        return spanAsync('validate', async (span) => {
            const smartConfig = await fetchSmartConfiguration(this._session.server)
            if ('error' in smartConfig) {
                logger.error(`Failed to fetch smart configuration: ${smartConfig.error}`)
                return false
            }

            logger.info(`Fetched well known configuration from session.issuer, jwks_uri: ${smartConfig['jwks_uri']}`)
            try {
                return await spanAsync('jwt-verify', async () => {
                    await jwtVerify(this._session.accessToken, getJwkSet(smartConfig['jwks_uri']), {
                        issuer: this._session.issuer,
                        algorithms: ['RS256'],
                    })

                    logger.info('Token verified!')
                    return true
                })
            } catch (e) {
                logger.error(new Error(`Token validation failed, ${(e as { code: string })?.code ?? 'UNKNOWN'}`))

                if (e instanceof Error) span.recordException(e)

                return false
            }
        })
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

    public async request<Path extends KnownPaths>(resource: Path): Promise<ResponseFor<Path> | ResourceRequestErrors> {
        const resourceType = resource.match(/\/(\w+)\b/)?.[1] ?? 'Unknown'

        return spanAsync(`request.${resourceType}`, async () => {
            const response = await getFhir({ session: this._session, path: resource })

            if (response.status === 404) {
                logger.warn(`Resource (${resource}) was not found on FHIR server`)
                return { error: 'REQUEST_FAILED_RESOURCE_NOT_FOUND' }
            }

            if (!response.ok) {
                const responseError = await getResponseError(response)
                logger.error(
                    new Error(
                        `Request to get ${resource} failed, ${response.url} responded with ${response.status} ${response.statusText}, server said: ${responseError}`,
                    ),
                )

                return { error: 'REQUEST_FAILED_NON_OK_RESPONSE' }
            }

            const result = await response.json()
            const parsed = resourceToSchema(resource).safeParse(result)
            if (!parsed.success) {
                logger.error(new Error(`Failed to parse ${resource}`, { cause: parsed.error }))
                return { error: 'REQUEST_FAILED_INVALID_RESPONSE' }
            }

            return parsed.data as ResponseFor<Path>
        })
    }
}

/**
 * Converts from a KnownPath to the actual FHIR zod schema for this resource.
 *
 * This function is a type-hole, the callee will have to as the resulting parsed schema to the correct type.
 */
function resourceToSchema(resource: KnownPaths): z.ZodObject {
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
