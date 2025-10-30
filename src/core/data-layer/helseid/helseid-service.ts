import { getHelseIdIdTokenInfo } from '@data-layer/helseid/helseid-user'
import { failSpan, spanServerAsync } from '@lib/otel/server'

type HelseIdBehandler = {
    /**
     * Null if logged in with HelseID, but not a healthcare professional (behandler).
     */
    hpr: string | null
    navn: string
}

export async function getHelseIdBehandler(): Promise<HelseIdBehandler | null> {
    return spanServerAsync('HelseID.getHelseIdBehandler', async (span) => {
        try {
            const tokenPayload = await getHelseIdIdTokenInfo()

            return {
                hpr: tokenPayload['helseid://claims/hpr/hpr_number'] ?? null,
                navn: tokenPayload.name,
            }
        } catch (e) {
            failSpan(span, 'Failed to get HelseID behandler', e as Error)

            return null
        }
    })
}
