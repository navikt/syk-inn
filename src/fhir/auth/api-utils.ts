import { headers } from 'next/headers'
import { logger } from '@navikt/next-logger'

import { verifyFhirToken } from '@fhir/auth/verify'

export async function ensureFhirApiAuthenticated(): Promise<Response | 'ok'> {
    const token = (await headers()).get('Authorization')
    if (token == null) {
        logger.warn('User tried submitting a sykmelding without a token')
        return Response.json({ message: 'Unauthorized' }, { status: 401 })
    }

    try {
        await verifyFhirToken(token)
        return 'ok'
    } catch (e) {
        logger.error('User tried submitting a sykmelding with an invalid token', { cause: e })
        return Response.json({ message: 'Unauthorized' }, { status: 401 })
    }
}
