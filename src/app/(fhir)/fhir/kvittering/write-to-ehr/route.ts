import { logger } from '@navikt/next-logger'

import { serverFhirResources } from '@fhir/fhir-data/fhir-data-server'
import { ExistingSykmeldingSchema } from '@services/syk-inn-api/SykInnApiSchema'
import { ensureValidFhirAuth } from '@fhir/auth/verify'
import { FhirDocumentReferenceResponse } from '@fhir/fhir-data/schema/documentReference'

type documentReferenceResponseResult = FhirDocumentReferenceResponse | { errors: { message: string }[] }

export async function POST(request: Request): Promise<Response> {
    const authStatus = await ensureValidFhirAuth()
    if (authStatus !== 'ok') {
        return authStatus
    }
    const verifiedPayload = ExistingSykmeldingSchema.safeParse(await request.json())

    if (!verifiedPayload.success) {
        logger.error(`Invalid payload: ${JSON.stringify(verifiedPayload.error, null, 2)}`)

        return Response.json([{ errors: { message: 'Invalid payload' } }] satisfies documentReferenceResponseResult)
    }

    const documentReferenceResponse = await serverFhirResources.createDocumentReference(verifiedPayload.data.pdf)

    return Response.json(documentReferenceResponse)
}
