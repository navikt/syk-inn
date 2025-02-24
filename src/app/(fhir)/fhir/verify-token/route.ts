import { ensureValidFhirAuth } from '@fhir/auth/verify'

/**
 * Used to show current status of the token verification lazily in the header
 *
 * Only used for testing purposes in this early phase
 */
export async function GET(): Promise<Response> {
    const secureAuth = await ensureValidFhirAuth()

    if (secureAuth !== 'ok') {
        return secureAuth
    }

    return Response.json({ ok: 'ok' })
}
