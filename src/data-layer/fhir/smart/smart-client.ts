import { GraphQLError } from 'graphql/error'

import {
    SmartClientConfiguration,
    SmartClientReadyErrors,
    SmartStorage,
    SmartClient,
    ReadyClient,
} from '@navikt/smart-on-fhir/client'
import { getValkeyClient } from '@services/valkey/client'
import { getAbsoluteURL } from '@utils/url'
import { getSessionId } from '@fhir/smart/session'
import { FhirPractitioner } from '@navikt/fhir-zod'
import { NoSmartSession } from '@graphql/error/Errors'

const smartClientConfig: SmartClientConfiguration = {
    client_id: 'syk-inn',
    scope: 'openid profile launch fhirUser patient/*.read user/*.read offline_access',
    redirect_url: `${getAbsoluteURL()}/fhir`,
    callback_url: `${getAbsoluteURL()}/fhir/callback`,
}

export function getSmartClient(): SmartClient {
    return new SmartClient(getSmartStorage(), smartClientConfig)
}

export async function getReadyClient(opts?: { validate: true }): Promise<ReadyClient | SmartClientReadyErrors> {
    const actualSessionId = await getSessionId()
    const readyClient = await getSmartClient().ready(actualSessionId)

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
}): Promise<[ReadyClient, FhirPractitioner]>
export async function getReadyClientForResolvers(params?: {
    withPractitioner: true
}): Promise<[ReadyClient] | [ReadyClient, FhirPractitioner]> {
    const client = await getReadyClient({ validate: true })
    if ('error' in client) {
        throw NoSmartSession()
    }

    if (params == null) {
        return [client]
    }

    const practitioner = await client.user.request()
    if ('error' in practitioner) {
        throw new GraphQLError('PARSING_ERROR')
    }

    return [client, practitioner]
}

function getSmartStorage(): SmartStorage {
    const valkey = getValkeyClient()

    return {
        set: async (sessionId, values) => {
            await valkey.hset(sessionIdKey(sessionId), values)
            await valkey.expire(sessionIdKey(sessionId), 8 * 60 * 60)
        },
        get: async (sessionId) => {
            return valkey.hgetall(sessionIdKey(sessionId))
        },
    }
}

function sessionIdKey(sessionId: string): string {
    return sessionId.startsWith('smart-session:') ? sessionId : `smart-session:${sessionId}`
}
