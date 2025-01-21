import { logger } from '@navikt/next-logger'

import { cleanPath } from '../../utils'
import testData from '../../data'

async function handler(req: Request): Promise<Response> {
    const url = new URL(req.url)
    const fhirPath = cleanPath(url.pathname)
    logger.info(`Incoming request: ${req.method} - ${fhirPath}`)

    if (req.method !== 'GET') {
        return new Response('Condition does not support other verbs than GET', { status: 501 })
    }

    if (fhirPath.startsWith('/Condition/')) {
        // Specific condition by ID
        const condition = testData.condition.byId(fhirPath.replace('/Condition/', ''))
        if (condition == null) {
            return new Response('Not found', { status: 404 })
        }
        return Response.json(condition, { status: 200 })
    }

    if (fhirPath.startsWith('/Condition') && url.searchParams != null) {
        const patientId = url.searchParams.get('patient')
        if (patientId == null) {
            return new Response('Only patient search is implemented', { status: 400 })
        }
        return Response.json(testData.condition.byPatientId(patientId), { status: 200 })
    }

    return new Response('Not implemented', { status: 501 })
}

export {
    handler as GET,
    handler as POST,
    handler as PUT,
    handler as DELETE,
    handler as PATCH,
    handler as OPTIONS,
    handler as HEAD,
}
