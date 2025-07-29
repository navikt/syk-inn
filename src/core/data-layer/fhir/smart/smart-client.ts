import { GraphQLError } from 'graphql/error'
import {
    SmartClientConfiguration,
    SmartClientReadyErrors,
    SmartStorage,
    SmartClient,
    ReadyClient,
} from '@navikt/smart-on-fhir/client'
import { FhirPractitioner } from '@navikt/smart-on-fhir/zod'
import Valkey from 'iovalkey'

import { productionValkey } from '@core/services/valkey/client'
import { getAbsoluteURL } from '@lib/url'
import { getSessionId } from '@data-layer/fhir/smart/session'
import { NoSmartSession } from '@data-layer/graphql/error/Errors'
import { getFlag, getUserlessToggles } from '@core/toggles/unleash'
import { isDemo, isE2E } from '@lib/env'
import { globalInMemoryValkey } from '@dev/mock-engine/valkey/global-inmem-valkey'

import { knownFhirServers } from './issuers'

const smartClientConfig: SmartClientConfiguration = {
    client_id: 'syk-inn',
    scope: 'openid profile launch fhirUser patient/*.read user/*.read offline_access',
    redirect_url: `${getAbsoluteURL()}/fhir`,
    callback_url: `${getAbsoluteURL()}/fhir/callback`,
    knownFhirServers,
}

export function getSmartClient(sessionId: string | null, autoRefreshToggle: boolean): SmartClient {
    return new SmartClient(sessionId, getSmartStorage(), smartClientConfig, {
        autoRefresh: autoRefreshToggle,
    })
}

export async function getReadyClient(opts: {
    validate: true
    autoRefresh: boolean
}): Promise<ReadyClient | SmartClientReadyErrors> {
    const actualSessionId = await getSessionId()
    const readyClient = await getSmartClient(actualSessionId, opts?.autoRefresh ?? false).ready()

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
    const autoTokenRefresh = getFlag('SYK_INN_REFRESH_TOKEN', await getUserlessToggles()).enabled
    const client = await getReadyClient({ validate: true, autoRefresh: autoTokenRefresh })
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
    const valkey = getBackingStore()

    return {
        set: async (sessionId, values) => {
            await valkey.hset(sessionIdKey(sessionId), values)
            // Refresh tokens expires in a month, should exp be less?
            await valkey.expire(sessionIdKey(sessionId), 60 * 60 * 24 * 30)
        },
        get: async (sessionId) => {
            return valkey.hgetall(sessionIdKey(sessionId))
        },
    }
}

function sessionIdKey(sessionId: string): string {
    return sessionId.startsWith('smart-session:') ? sessionId : `smart-session:${sessionId}`
}

/**
 * In e2e/demo, the in-memory store used for sessions is global, as opposed to the draft-client valkey which is
 * scoped per user.
 */
function getBackingStore(): Valkey {
    if (isE2E || isDemo) {
        return globalInMemoryValkey()
    } else {
        return productionValkey()
    }
}
