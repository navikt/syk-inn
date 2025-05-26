import {
    SmartClientConfiguration,
    SmartClientReadyErrors,
    SmartStorage,
    SmartClient,
    ReadyClient,
} from '@navikt/smart-on-fhir/client'
import { getValkeyClient } from '@services/valkey/client'
import { getAbsoluteURL } from '@utils/url'
import { getSessionId } from '@data-layer/fhir/auth/session'

import { spanAsync } from '../../otel/otel'

const smartClientConfig: SmartClientConfiguration = {
    client_id: 'syk-inn',
    scope: 'openid profile launch fhirUser patient/*.read user/*.read offline_access',
    redirect_url: `${getAbsoluteURL()}/fhir`,
    callback_url: `${getAbsoluteURL()}/fhir/callback`,
}

export function getSmartClient(): SmartClient {
    return new SmartClient(getSmartStorage(), smartClientConfig)
}

export async function getReadyClient({ validate }: { validate: true }): Promise<ReadyClient | SmartClientReadyErrors> {
    return spanAsync('smart client init', async () => {
        const actualSessionId = await getSessionId()
        const readyClient = await getSmartClient().ready(actualSessionId)

        if (validate) {
            const validToken = await readyClient.validate()
            if (!validToken) {
                return { error: 'INVALID_TOKEN' }
            }
        }

        return readyClient
    })
}

async function getSmartStorage(): Promise<SmartStorage> {
    const valkey = await getValkeyClient()

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
