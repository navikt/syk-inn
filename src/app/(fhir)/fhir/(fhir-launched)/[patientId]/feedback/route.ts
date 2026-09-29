import { logger } from '@navikt/next-logger'
import { NextRequest } from 'next/server'

import { handleFeedback } from '#core/services/feedback/feedback-service'
import { getBehandler, isResourceError } from '#data-layer/fhir/resources/fhir-resources-service'
import { getReadyClient } from '#data-layer/fhir/smart/ready-client'
import { failSpan, spanServerAsync } from '#lib/otel/server'

export async function POST(
    request: NextRequest,
    { params }: RouteContext<'/fhir/[patientId]/feedback'>,
): Promise<Response> {
    return spanServerAsync('Feedback.POST', async (span) => {
        const { patientId } = await params
        const client = await getReadyClient(patientId)
        if ('error' in client) {
            failSpan(span, 'Failed to get FHIR client', new Error(client.error))
            return Response.json({ message: client.error }, { status: 500 })
        }

        const behandler = await getBehandler(client)
        if (isResourceError(behandler)) {
            failSpan(span, `Failed to fetch practitioner resource: ${behandler.error}`)
            return Response.json({ message: 'Failed to fetch practitioner resource' }, { status: 500 })
        }

        logger.info('Received feedback with HPR and name!')
        const json = await request.json()
        const feedback = await handleFeedback(json, {
            hpr: behandler.hpr,
            name: behandler.navn,
            system: client.issuerName,
        })

        if (!('feedbackId' in feedback)) {
            failSpan(span, 'Failed to handle feedback', new Error(feedback.message))
            return Response.json({ message: feedback.message }, { status: feedback.code })
        }

        logger.info('Successfully handled feedback')
        return Response.json({ feedbackId: feedback.feedbackId })
    })
}
