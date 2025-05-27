import { synchronizeSykmeldingRoute } from '@data-layer/api-routes/route-handlers'
import { getReadyClient } from '@data-layer/fhir/smart-client'
import { createDocumentReference } from '@data-layer/fhir/fhir-engine'

export const POST = synchronizeSykmeldingRoute(async (sykmeldingId) => {
    const client = await getReadyClient({ validate: true })
    if ('error' in client) {
        return { error: 'AUTH_ERROR' }
    }

    const existingDocument = await client.request(`/DocumentReference/${sykmeldingId}`)
    if ('resourceType' in existingDocument) {
        return {
            nav: 'ok',
            documentStatus: 'complete',
        }
    }

    if ('error' in existingDocument && existingDocument.error === 'REQUEST_FAILED_RESOURCE_NOT_FOUND') {
        const createResult = await createDocumentReference(client, sykmeldingId)
        if ('error' in createResult) {
            return { error: 'API_ERROR' }
        }

        return {
            nav: 'ok',
            documentStatus: 'complete',
        }
    }

    return { error: 'API_ERROR' }
})
