import { failSpan, spanServerAsync } from '@lib/otel/server'
import { wait } from '@lib/wait'

import { feedbackPayloadSchema } from './feedback-payload'
import { getFeedbackClient } from './feedback-client'

export async function handleV2Feedback(
    json: unknown,
    meta: { name: string; hpr: string; system: string },
): Promise<'ok' | { message: string; code: number }> {
    return spanServerAsync('Feedback.handleV2Feedback', async (span) => {
        const payload = feedbackPayloadSchema.safeParse(json)
        if (!payload.success) {
            failSpan(span, 'Invalid feedback payload', payload.error)
            return { message: 'Feil format på tilbakemeldingen', code: 400 }
        }

        await wait(1500)

        const feedbackClient = getFeedbackClient()

        const uuid = crypto.randomUUID()
        await feedbackClient.create(uuid, {
            category: payload.data.type,
            message: payload.data.message,
            user: {
                name: meta.name,
                hpr: meta.hpr,
            },
            sentiment: toValidSentiment(payload.data.sentiment),
            contact: {
                type: payload.data.contact.type,
                details: payload.data.contact.details,
            },
            meta: {
                tags: [],
                location: payload.data.meta.location,
                dev: payload.data.meta.dev,
                system: meta.system,
            },
        })

        return 'ok'
    })
}

function toValidSentiment(sentiment: number | null): number | null {
    if (sentiment == null) return null
    if (sentiment < 1 || sentiment > 5) return null
    return sentiment
}
