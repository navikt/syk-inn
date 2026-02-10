import { NextRequest } from 'next/server'
import { logger } from '@navikt/next-logger'

import { getReadyClient } from '@data-layer/fhir/smart/ready-client'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { getNameFromFhir } from '@data-layer/fhir/mappers/patient'
import { failSpan, spanServerAsync } from '@lib/otel/server'
import { handleOldPilotFeedback } from '@core/services/feedback/old-feedback'
import { handleV2Feedback } from '@core/services/feedback/feedback-service'

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
        const practitioner = await client.user.request()
        if ('error' in practitioner) {
            failSpan(span, 'Failed to fetch practitioner resource', new Error(practitioner.error))
            return Response.json({ message: practitioner.error }, { status: 500 })
        }

        const hpr = getHpr(practitioner.identifier)
        if (hpr == null) {
            failSpan(span, 'Missing HPR identifier in practitioner resource')
            return Response.json({ message: 'Vi fant ikke et gyldig HPR nummer' }, { status: 500 })
        }
        const behandlerName = getNameFromFhir(practitioner.name)

        const json = await request.json()
        const variant = request.nextUrl.searchParams.get('variant')
        if (variant === 'v2') {
            logger.info('Received V2 feedback')
            const feedback = await handleV2Feedback(json, {
                hpr: hpr,
                name: behandlerName,
                system: client.issuerName,
            })

            if (typeof feedback !== 'string') {
                failSpan(span, 'Failed to handle V2 feedback', new Error(feedback.message))
                return Response.json({ message: feedback.message }, { status: feedback.code })
            }

            logger.info('Successfully handled V2 feedback')
            return Response.json({ ok: 'ok' })
        } else {
            logger.info('Received "old" pilot feedback')
            const feedback = await handleOldPilotFeedback(json, {
                hpr: hpr,
                name: behandlerName,
            })

            if (typeof feedback !== 'string') {
                failSpan(span, 'Failed to handle old pilot feedback', new Error(feedback.message))
                return Response.json({ message: feedback.message }, { status: feedback.code })
            }

            logger.info('Successfully handled old pilot feedback')
            return Response.json({ ok: 'ok' })
        }
    })
}
