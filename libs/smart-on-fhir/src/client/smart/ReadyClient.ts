import { decodeJwt, jwtVerify } from 'jose'
import { FhirEncounter, FhirPatient, FhirPractitioner } from '@navikt/fhir-zod'

import { CompleteSession } from '../storage/schema'
import { logger } from '../logger'
import { OtelTaxonomy, spanAsync } from '../otel'
import { getResponseError } from '../utils'

import { IdToken, IdTokenSchema } from './launch/token-schema'
import { fetchSmartConfiguration, getJwkSet } from './well-known/smart-configuration'
import { getFhir, postFhir } from './resources/fetcher'
import { SmartClient } from './SmartClient'
import { ResourceCreateErrors, ResourceRequestErrors } from './client-errors'
import { KnownPaths, resourceToSchema, ResponseFor } from './resources/resource-map'
import {
    createResourceToSchema,
    KnownCreatePaths,
    PayloadForCreate,
    ResponseForCreate,
} from './resources/create-resource-map'

/**
 * **Smart App Launch reference**
 * - Accessing the FHIR API: https://build.fhir.org/ig/HL7/smart-app-launch/app-launch.html#access-fhir-api
 *
 * A client that is ready to access the FHIR API after a successful Smart App Launch.
 *
 * Everything is strongly typed and zod'd!
 */
export class ReadyClient {
    private readonly _client: SmartClient
    private readonly _session: CompleteSession
    private readonly _idToken: IdToken

    constructor(client: SmartClient, session: CompleteSession) {
        this._client = client
        this._session = session
        this._idToken = IdTokenSchema.parse(decodeJwt(session.idToken))
    }

    public get patient(): ValueAccessor<FhirPatient, 'Patient'> {
        return {
            type: 'Patient',
            reference: `Patient/${this._session.patient}`,
            id: this._session.patient,
            request: () => this.request(`Patient/${this._session.patient}`),
        }
    }

    public get encounter(): ValueAccessor<FhirEncounter, 'Encounter'> {
        return {
            type: 'Encounter',
            reference: `Encounter/${this._session.encounter}`,
            id: this._session.encounter,
            request: () => this.request(`Encounter/${this._session.encounter}`),
        }
    }

    public get user(): {
        fhirUser: `Practitioner/${string}`
        request: () => Promise<FhirPractitioner | ResourceRequestErrors>
    } {
        const session = this._session
        const idToken = this._idToken

        return {
            get fhirUser(): `Practitioner/${string}` {
                if (session.webmedPractitioner) {
                    return `Practitioner/${session.webmedPractitioner}`
                }

                if (idToken.fhirUser == null) {
                    throw new Error('WebMed hack: No webmedPractitioner and no idToken.fhirUser, what up?')
                }

                return idToken.fhirUser as `Practitioner/${string}`
            },
            request: () => this.request(this.user.fhirUser),
        }
    }

    public async validate(): Promise<boolean> {
        logger.info(
            `Current users issuer: ${this._session.issuer}, looking for well known at /.well-known/smart-configuration`,
        )

        return spanAsync('validate', async (span) => {
            span.setAttribute(OtelTaxonomy.FhirServer, this._session.server)

            const smartConfig = await fetchSmartConfiguration(this._session.server)
            if ('error' in smartConfig) {
                logger.error(`Failed to fetch smart configuration: ${smartConfig.error}`)
                return false
            }

            logger.info(`Fetched well known configuration from session.issuer, jwks_uri: ${smartConfig['jwks_uri']}`)
            try {
                return await spanAsync('jwt-verify', async (span) => {
                    span.setAttribute(OtelTaxonomy.FhirServer, this._session.server)

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

    public async create<Path extends KnownCreatePaths>(
        resource: Path,
        params: { payload: PayloadForCreate<Path> },
    ): Promise<ResponseForCreate<Path> | ResourceCreateErrors> {
        const resourceType = resource.match(/(\w+)\b/)?.[1] ?? 'Unknown'

        return spanAsync(`create.${resourceType}`, async (span) => {
            span.setAttributes({
                [OtelTaxonomy.FhirResource]: resourceType,
                [OtelTaxonomy.FhirServer]: this._session.server,
            })

            const response = await postFhir({ session: this._session, path: resource }, { payload: params.payload })

            if (!response.ok) {
                const responseError = await getResponseError(response)

                logger.error(
                    new Error(
                        `Request to create ${resourceType} failed, ${response.url} responded with ${response.status} ${response.statusText}, server says: ${responseError}`,
                    ),
                )

                return { error: 'CREATE_FAILED_NON_OK_RESPONSE' }
            }

            const result = await response.json()

            const parsed = createResourceToSchema(resource).safeParse(result)
            if (!parsed.success) {
                logger.error(new Error('Failed to parse DocumentReference', { cause: parsed.error }))
                return { error: 'CREATE_FAILED_INVALID_RESPONSE' }
            }

            return parsed.data as ResponseForCreate<Path>
        })
    }

    public async request<Path extends KnownPaths>(resource: Path): Promise<ResponseFor<Path> | ResourceRequestErrors> {
        const resourceType = resource.match(/(\w+)\b/)?.[1] ?? 'Unknown'

        return spanAsync(`request.${resourceType}`, async (span) => {
            span.setAttributes({
                [OtelTaxonomy.FhirResource]: resourceType,
                [OtelTaxonomy.FhirServer]: this._session.server,
            })

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

type ValueAccessor<Resource, Type extends string = never> = {
    id: string
    type: Type
    request: () => Promise<Resource | ResourceRequestErrors>
    reference: `${Type}/${string}`
}
