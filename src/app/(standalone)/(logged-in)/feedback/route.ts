import { NextRequest } from 'next/server'
import { logger } from '@navikt/next-logger'

import { failSpan, spanServerAsync } from '@lib/otel/server'
import { handleV2Feedback } from '@core/services/feedback/feedback-service'
import { validateHelseIdToken } from '@data-layer/helseid/token/validate'
import { NoHelseIdSession } from '@data-layer/helseid/error/Errors'
import { getHelseIdBehandler } from '@data-layer/helseid/helseid-service'

export async function POST(request: NextRequest): Promise<Response> {
    return spanServerAsync('Feedback(HelseID).POST', async (span) => {
        const validToken = await validateHelseIdToken()
        if (!validToken) {
            failSpan(span, 'Invalid or missing HelseID token')
            throw NoHelseIdSession()
        }

        const behandler = await getHelseIdBehandler()
        if (behandler?.hpr == null) {
            failSpan(span, 'Behandler without HPR (HelseID)')
            throw NoHelseIdSession()
        }

        logger.info('Received HelseID feedback with HPR and name!')
        const json = await request.json()
        const feedback = await handleV2Feedback(json, {
            hpr: behandler.hpr,
            name: behandler.navn,
            system: 'HelseID',
        })

        if (!('feedbackId' in feedback)) {
            failSpan(span, 'Failed to handle HelseID feedback', new Error(feedback.message))
            return Response.json({ message: feedback.message }, { status: feedback.code })
        }

        logger.info('Successfully handled HelseID feedback')
        return Response.json({ feedbackId: feedback.feedbackId })
    })
}
