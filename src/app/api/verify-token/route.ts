import { headers } from 'next/headers'
import { logger } from '@navikt/next-logger'

import { verifyFhirToken } from '@fhir/auth/verify'

export async function GET(): Promise<Response> {
    const token = (await headers()).get('Authorization')

    if (!token) {
        return Response.json({ message: 'No token provided' })
    }

    try {
        await verifyFhirToken(token!)
        return Response.json({ ok: 'ok' })
    } catch (e) {
        logger.error(e)
        if (e instanceof Error) {
            return Response.json({ message: e.message ?? 'Unknown error' })
        } else {
            return Response.json({ message: e?.toString() ?? 'Unknown error' })
        }
    }
}
