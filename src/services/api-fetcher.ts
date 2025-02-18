import { requestAzureClientCredentialsToken } from '@navikt/oasis'
import { logger as pinoLogger } from '@navikt/next-logger'
import { z } from 'zod'

import { raise } from '@utils/ts'

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

type FetchInternalAPIOptionsWithSchema<T extends z.ZodType, AdditionalErrors> = {
    api: keyof typeof internalApis
    path: `/${string}`
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD'
    headers?: HeadersInit
    body?: BodyInit
    responseSchema: T
    onApiError?: (response: Response) => AdditionalErrors | undefined
}

export async function fetchInternalAPI<Schema extends z.ZodType, AdditionalErrors extends string = never>({
    api,
    path,
    headers,
    method,
    body,
    responseSchema,
    onApiError,
}: FetchInternalAPIOptionsWithSchema<Schema, AdditionalErrors>): Promise<
    z.infer<Schema> | ApiFetchErrors<AdditionalErrors>
> {
    const apiConfig = internalApis[api]
    const scope = `api://dev-gcp.${apiConfig.namespace}.${api}/.default`

    const tokenResult = await requestAzureClientCredentialsToken(scope)
    if (!tokenResult.ok) {
        logger.error(`Unable to exchange client credentials token for ${scope}`, {
            cause: tokenResult.error,
        })

        return { errorType: 'TOKEN_EXCHANGE_FAILED' }
    }

    const response = await fetch(`http://${api}${path}`, {
        method,
        headers: {
            Authorization: `Bearer ${tokenResult.token}`,
            ...headers,
        },
        body,
    })

    if (!response.ok) {
        const additionalError = onApiError?.(response)
        if (additionalError) {
            return additionalError
        }

        const responseBody = await getFailedResponseBody(response)
        logger.error(`Unable to fetch ${path} (${response.status} ${response.statusText}), details: ${responseBody}`)

        return { errorType: 'API_CALL_FAILED' }
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
        logger.error(`Invalid response from ${path}, details: ${parsed.error.errors}`)
        return { errorType: 'API_BODY_INVALID' }
    }

    return parsed.data
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
