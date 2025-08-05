import { SmartClient, SmartClientConfiguration, SmartStorage } from '@navikt/smart-on-fhir/client'
import Valkey from 'iovalkey'

import { productionValkey } from '@core/services/valkey/client'
import { getAbsoluteURL } from '@lib/url'
import { isDemo, isE2E, isLocal } from '@lib/env'
import { globalInMemoryValkey } from '@dev/mock-engine/valkey/global-inmem-valkey'

import { getKnownFhirServers } from './issuers'

const smartClientScopes = [
    'openid',
    'profile',
    'launch',
    'fhirUser',
    'offline_access',
    'patient/Patient.read',
    'patient/Encounter.read',
    'patient/Condition.read',
    'patient/DocumentReference.read',
    'patient/DocumentReference.write',
]

if (isDemo || isLocal) {
    smartClientScopes.push('https://helseid.nhn.no')
}

const smartClientConfig: Omit<SmartClientConfiguration, 'knownFhirServers'> = {
    clientId: 'syk-inn',
    scope: smartClientScopes.join(' '),
    redirectUrl: `${getAbsoluteURL()}/fhir`,
    callbackUrl: `${getAbsoluteURL()}/fhir/callback`,
}

export function getSmartClient(
    sessionId: string | null,
    activePatient: string | null,
    autoRefreshToggle: boolean,
): SmartClient {
    return new SmartClient(
        { sessionId: sessionId, activePatient: activePatient },
        getSmartStorage(),
        { ...smartClientConfig, knownFhirServers: getKnownFhirServers() },
        { autoRefresh: autoRefreshToggle, enableMultiLaunch: true },
    )
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
