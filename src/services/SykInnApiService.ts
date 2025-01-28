import { requestAzureClientCredentialsToken } from '@navikt/oasis'
import { logger } from '@navikt/next-logger'

import {
    ExistingSykmelding,
    ExistingSykmeldingSchema,
    NySykmelding,
    NySykmeldingSchema,
} from '@services/SykInnApiSchema'

const API_CONFIG = {
    URL: 'http://syk-inn-api',
    SCOPE: 'api://dev-gcp.tsm.syk-inn-api/.default',
}

type NySykmeldingPayload = {
    pasientFnr: string
    sykmelderHpr: string
    sykmelding: {
        hoveddiagnose: {
            system: 'ICD10' | 'ICPC2'
            code: string
        }
        aktivitet:
            | {
                  type: 'AKTIVITET_IKKE_MULIG'
                  fom: string
                  tom: string
              }
            | {
                  type: 'GRADERT'
                  grad: number
                  fom: string
                  tom: string
              }
    }
}

export async function createNewSykmelding(payload: NySykmeldingPayload): Promise<
    | NySykmelding
    | {
          errorType: 'TOKEN_EXCHANGE_FAILED' | 'API_CALL_FAILED' | 'API_BODY_INVALID'
      }
> {
    const tokenResult = await requestAzureClientCredentialsToken(API_CONFIG.SCOPE)
    if (!tokenResult.ok) {
        logger.error(`Unable to exchange client credentials token for ${API_CONFIG.SCOPE}`, {
            cause: tokenResult.error,
        })
        return { errorType: 'TOKEN_EXCHANGE_FAILED' }
    }

    const response = await fetch(`${API_CONFIG.SCOPE}/api/v1/sykmelding/create`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${tokenResult.token}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        logger.error(`Failed to create new sykmelding, ${response.status} ${response.statusText}`)

        return { errorType: 'API_CALL_FAILED' }
    }

    const parsed = NySykmeldingSchema.safeParse(await response.json())

    if (!parsed.success) {
        logger.error('Failed to parse ny sykmelding response', parsed.error)
        return { errorType: 'API_BODY_INVALID' }
    }

    return parsed.data
}

export async function getSykmelding(
    sykmeldingId: string,
    hpr: string,
): Promise<
    | ExistingSykmelding
    | {
          errorType: 'TOKEN_EXCHANGE_FAILED' | 'API_CALL_FAILED' | 'API_BODY_INVALID'
      }
> {
    const tokenResult = await requestAzureClientCredentialsToken(API_CONFIG.SCOPE)
    if (!tokenResult.ok) {
        logger.error(`Unable to exchange client credentials token for ${API_CONFIG.SCOPE}`, {
            cause: tokenResult.error,
        })
        return { errorType: 'TOKEN_EXCHANGE_FAILED' }
    }

    const response = await fetch(`${API_CONFIG.URL}/api/v1/sykmelding/${sykmeldingId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${tokenResult.token}`,
            'Content-Type': 'application/json',
            'X-HPR': hpr,
        },
    })

    if (!response.ok) {
        logger.error(`Failed to create new sykmelding, ${response.status} ${response.statusText}`)

        return { errorType: 'API_CALL_FAILED' }
    }

    const parsed = ExistingSykmeldingSchema.safeParse(await response.json())

    if (!parsed.success) {
        return { errorType: 'API_BODY_INVALID' }
    }

    return parsed.data
}
