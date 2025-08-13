import { ReadyClient, SmartClientReadyErrors } from '@navikt/smart-on-fhir/client'
import { FhirPractitioner } from '@navikt/smart-on-fhir/zod'
import { logger } from '@navikt/next-logger'
import { GraphQLError } from 'graphql/error'

import { getFlag, getUserlessToggles } from '@core/toggles/unleash'
import { NoSmartSession } from '@data-layer/graphql/error/Errors'
import { isDemo, isLocal } from '@lib/env'
import { getActivePatient } from '@data-layer/fhir/smart/active-patient'

import { HelseIdClaimSchema } from './helseid'
import { getSmartClient } from './smart-client'
import { getSessionId } from './session'

export async function getReadyClient(opts: {
    validate: true
    autoRefresh: boolean
}): Promise<ReadyClient | SmartClientReadyErrors> {
    const actualSessionId = await getSessionId()
    const activePatient = await getActivePatient()
    const readyClient = await getSmartClient(actualSessionId, activePatient, opts?.autoRefresh ?? false).ready()

    if (opts?.validate) {
        const validToken = await readyClient.validate()
        if (!validToken) {
            return { error: 'INVALID_TOKEN' }
        }
    }

    return readyClient
}

export async function getReadyClientForResolvers(): Promise<[ReadyClient]>
export async function getReadyClientForResolvers(params: {
    withPractitioner: true
    validateHelseId?: boolean
}): Promise<[ReadyClient, FhirPractitioner]>
export async function getReadyClientForResolvers(params?: {
    withPractitioner: true
    validateHelseId?: boolean
}): Promise<[ReadyClient] | [ReadyClient, FhirPractitioner]> {
    const autoTokenRefresh = getFlag('SYK_INN_REFRESH_TOKEN', await getUserlessToggles()).enabled
    const client = await getReadyClient({ validate: true, autoRefresh: autoTokenRefresh })
    if ('error' in client) {
        throw NoSmartSession()
    }

    if (params == null) {
        return [client]
    }

    if (params.validateHelseId && (isLocal || isDemo)) {
        try {
            const helseIdClaim = client.getClaim('https://helseid.nhn.no', HelseIdClaimSchema)

            if ('error' in helseIdClaim) {
                logger.warn(
                    `Smart session was attempted to be launched with HelseID claim, but client says: ${helseIdClaim.error}`,
                )
            } else {
                logger.info(
                    `Smart session is launched with HelseID claim, and access_token of length ${helseIdClaim.access_token.length} was found`,
                )
            }
        } catch (e) {
            logger.warn(
                new Error(
                    'HelseID token validation is only in proof-of-concept mode, this is expected in demo/local, ignoring claim error',
                    { cause: e },
                ),
            )
        }
    }

    const practitioner = await client.user.request()
    if ('error' in practitioner) {
        throw new GraphQLError('PARSING_ERROR')
    }

    return [client, practitioner]
}
