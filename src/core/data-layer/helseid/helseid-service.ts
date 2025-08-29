import { getHelseIdIdTokenInfo } from '@data-layer/helseid/helseid-user'
import { isDemo, isE2E, isLocal } from '@lib/env'

type HelseIdBehandler = {
    /**
     * Null if logged in with HelseID, but not a healthcare professional (behandler).
     */
    hpr: string | null
    navn: string
}

export async function getHelseIdBehandler(): Promise<HelseIdBehandler> {
    if (isLocal || isDemo || isE2E) {
        return {
            hpr: '123456',
            navn: 'Mock Mockesson',
        }
    }

    const tokenPayload = await getHelseIdIdTokenInfo()

    return {
        hpr: tokenPayload['helseid://claims/hpr/hpr_number'] ?? null,
        navn: tokenPayload.name,
    }
}
