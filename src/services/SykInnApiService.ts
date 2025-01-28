import { requestAzureClientCredentialsToken } from '@navikt/oasis'
import { logger } from '@navikt/next-logger'

import { ExistingSykmelding, ExistingSykmeldingSchema } from '@services/SykInnApiSchema'

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

const SYK_INN_API_URL = 'http://syk-inn-api'
const SYK_INN_API_SCOPE = 'api://dev-gcp.tsm.syk-inn-api/.default'

export async function createNewSykmelding(payload: NySykmeldingPayload): Promise<
    | 'ok'
    | {
          errorType: 'TOKEN_EXCHANGE_FAILED' | 'API_CALL_FAILED'
      }
> {
    const tokenResult = await requestAzureClientCredentialsToken(SYK_INN_API_SCOPE)
    if (!tokenResult.ok) {
        logger.error(`Unable to exchange client credentials token for ${SYK_INN_API_SCOPE}`, {
            cause: tokenResult.error,
        })
        return { errorType: 'TOKEN_EXCHANGE_FAILED' }
    }

    const response = await fetch(`${SYK_INN_API_URL}/api/v1/sykmelding/create`, {
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

    return 'ok'
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
    const tokenResult = await requestAzureClientCredentialsToken(SYK_INN_API_SCOPE)
    if (!tokenResult.ok) {
        logger.error(`Unable to exchange client credentials token for ${SYK_INN_API_SCOPE}`, {
            cause: tokenResult.error,
        })
        return { errorType: 'TOKEN_EXCHANGE_FAILED' }
    }

    const response = await fetch(`${SYK_INN_API_URL}/api/v1/sykmelding/${sykmeldingId}`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${tokenResult.token}`,
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
