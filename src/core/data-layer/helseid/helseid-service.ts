import { getHelseIdIdTokenInfo } from '@data-layer/helseid/helseid-user'

type HelseIdBehandler = {
    /**
     * Null if logged in with HelseID, but not a healthcare professional (behandler).
     */
    hpr: string | null
    navn: string
}

export async function getHelseIdBehandler(): Promise<HelseIdBehandler> {
    const tokenPayload = await getHelseIdIdTokenInfo()

    return {
        hpr: tokenPayload['helseid://claims/hpr/hpr_number'],
        navn: tokenPayload.name,
    }
}
