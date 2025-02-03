import { requestAzureClientCredentialsToken } from '@navikt/oasis'
import { logger } from '@navikt/next-logger'

import { PdlPerson, PdlPersonSchema } from './PdlApiSchema'

const API_CONFIG = {
    URL: 'http://tsm-pdl-cache',
    SCOPE: 'api://dev-gcp.tsm.tsm-pdl-cache/.default',
}

export type GetPersonResult =
    | PdlPerson
    | {
          errorType: 'TOKEN_EXCHANGE_FAILED' | 'API_CALL_FAILED' | 'API_BODY_INVALID' | 'PERSON_NOT_FOUND'
      }

export async function getPdlPerson(ident: string): Promise<GetPersonResult> {
    const tokenResult = await requestAzureClientCredentialsToken(API_CONFIG.SCOPE)
    if (!tokenResult.ok) {
        logger.error(`Unable to exchange client credentials token for ${API_CONFIG.SCOPE}`, {
            cause: tokenResult.error,
        })
        return { errorType: 'TOKEN_EXCHANGE_FAILED' }
    }

    const response = await fetch(`${API_CONFIG.URL}/api/person`, {
        method: 'GET',
        headers: {
            Ident: ident,
            Authorization: `Bearer ${tokenResult.token}`,
        },
    })

    if (!response.ok) {
        logger.error(`Unable to fetch person with ident ${ident} (${response.status} ${response.statusText}`)

        if (response.status === 404) {
            return { errorType: 'PERSON_NOT_FOUND' }
        }

        return { errorType: 'API_CALL_FAILED' }
    }

    const parsed = PdlPersonSchema.safeParse(await response.json())
    if (!parsed.success) {
        logger.error('Failed to parse person response', parsed.error)
        return { errorType: 'API_BODY_INVALID' }
    }

    return parsed.data
}
