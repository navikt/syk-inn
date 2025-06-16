import { requestAzureClientCredentialsToken } from '@navikt/oasis'
import { logger as pinoLogger } from '@navikt/next-logger'
import * as z from 'zod/v4'

import { raise } from '@utils/ts'
import { getServerEnv } from '@utils/env'

const logger = pinoLogger.child({}, { msgPrefix: '[API FETCHER]: ' })

type ValidAPI = 'syk-inn-api' | 'tsm-pdl-cache'

type ApiConfig = {
    namespace: string
}

const internalApis: Record<ValidAPI, ApiConfig> = {
    'syk-inn-api': { namespace: 'tsm' },
    'tsm-pdl-cache': { namespace: 'tsm' },
}

type ErrorTypes = 'TOKEN_EXCHANGE_FAILED' | 'API_CALL_FAILED' | 'API_BODY_INVALID'

export type ApiFetchErrors<AdditionalErrors extends string = never> = {
    errorType: ErrorTypes | AdditionalErrors
}

type NonZodResponses = {
    ArrayBuffer: ArrayBuffer
}

type ValidNonZodResponses = keyof NonZodResponses

type FetchInternalAPIOptionsWithSchema<T extends z.ZodType | ValidNonZodResponses, AdditionalErrors> = {
    api: keyof typeof internalApis
    path: `/${string}`
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'
    headers?: HeadersInit
    body?: BodyInit
    responseSchema: T
    onApiError?: (response: Response) => AdditionalErrors | undefined
}

export async function fetchInternalAPI<
    Schema extends z.ZodType | ValidNonZodResponses,
    AdditionalErrors extends string = never,
    InferredReturnValue = Schema extends z.ZodType
        ? z.infer<Schema>
        : Schema extends ValidNonZodResponses
          ? NonZodResponses[Schema]
          : never,
>({
    api,
    path,
    headers,
    method,
    body,
    responseSchema,
    onApiError,
}: FetchInternalAPIOptionsWithSchema<Schema, AdditionalErrors>): Promise<
    InferredReturnValue | ApiFetchErrors<AdditionalErrors>
> {
    const apiConfig = await getApi(api)
    if ('errorType' in apiConfig) {
        return apiConfig
    }

    const response = await fetch(`http://${apiConfig.host}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${apiConfig.token}`,
            ...headers,
        },
        body,
    })

    if (!response.ok) {
        const additionalError: AdditionalErrors | undefined = onApiError?.(response)
        if (additionalError) {
            return { errorType: additionalError }
        }

        const responseBody = await getFailedResponseBody(response)
        logger.error(`Unable to fetch ${path} (${response.status} ${response.statusText}), details: ${responseBody}`)

        return { errorType: 'API_CALL_FAILED' }
    }

    const isPdfResponse: boolean = response.headers.get('Content-Type')?.includes('application/pdf') ?? false
    if (typeof responseSchema === 'string' && responseSchema === 'ArrayBuffer') {
        return (await response.arrayBuffer()) as InferredReturnValue
    } else if (isPdfResponse && responseSchema !== 'ArrayBuffer') {
        raise(`Got PDF but expected response was not ArrayBuffer, for ${api}${path}, whats up?`)
    }

    const isJsonResponse: boolean = response.headers.get('Content-Type')?.includes('application/json') ?? false
    if (!isJsonResponse) {
        raise(
            `Did not get JSON payload (got: ${response.headers.get('Content-Type') ?? 'nothing'}) was provided for ${api}${path}`,
        )
    }

    const result: unknown = await response.json()
    const parsed = responseSchema.safeParse(result)

    if (!parsed.success) {
        logger.error(`Invalid response from ${path}, details: ${JSON.stringify(parsed.error, null, 2)}`)
        return { errorType: 'API_BODY_INVALID' }
    }

    /**
     * TODO: Can this as be avoided?
     *
     * See: https://zod.dev/v4/changelog?id=updates-generics
     */
    return parsed.data as InferredReturnValue
}

export async function getApi(
    api: ValidAPI,
): Promise<{ host: string; token: string } | { errorType: 'TOKEN_EXCHANGE_FAILED' }> {
    if (getServerEnv().useLocalSykInnApi) {
        return { host: 'localhost:8080', token: 'foo-bar-baz' }
    }

    const apiConfig = internalApis[api]
    const scope = `api://dev-gcp.${apiConfig.namespace}.${api}/.default`

    const tokenResult = await requestAzureClientCredentialsToken(scope)
    if (!tokenResult.ok) {
        logger.error(`Unable to exchange client credentials token for ${scope}`, {
            cause: tokenResult.error,
        })

        return { errorType: 'TOKEN_EXCHANGE_FAILED' }
    }

    return {
        host: api,
        token: tokenResult.token,
    }
}

async function getFailedResponseBody(response: Response): Promise<string> {
    if (response.headers.get('Content-Type')?.includes('text/plain')) {
        return await response.text()
    } else if (response.headers.get('Content-Type')?.includes('application/json')) {
        return JSON.stringify(await response.json(), null, 2)
    } else {
        return 'No failed response body'
    }
}
