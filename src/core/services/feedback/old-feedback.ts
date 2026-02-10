import * as z from 'zod'
import { context } from '@opentelemetry/api'
import { suppressTracing } from '@opentelemetry/core'

import { failSpan, spanServerAsync } from '@lib/otel/server'
import { getServerEnv } from '@lib/env'

type Feedback = z.infer<typeof feedbackSchema>
const feedbackSchema = z.object({
    type: z.enum(['FEIL', 'FORSLAG', 'ANNET']),
    message: z.string(),
})

export function handleOldPilotFeedback(
    json: unknown,
    meta: {
        name: string
        hpr: string
    },
): Promise<'ok' | { message: string; code: number }> {
    return spanServerAsync('Feedback.handleOldPilotFeedback', async (span) => {
        const body = feedbackSchema.safeParse(json)
        if (!body.success) {
            failSpan(
                span,
                'Invalid pilot feedback format',
                new Error('Invalid pilot feedback format', { cause: body.error }),
            )
            return { message: 'Feil format på tilbakemeldingen', code: 400 }
        }

        const webhook = getServerEnv().pilotFeedbackSlackWebhook
        if (!webhook) {
            failSpan(span, 'Pilot feedback webhook not configured')
            return { message: 'Pilot-feedback er ikke konfigurert', code: 500 }
        }

        const header = `Tilbakemelding fra pilotbruker (${body.data.type.toLowerCase()} ${typeEmoji(body.data.type)})`
        const author = `Fra ${meta.name}, kl ${new Date().toLocaleTimeString('nb-NO', {
            timeZone: 'Europe/Oslo',
        })}`

        try {
            const response = await spanServerAsync('Slack webhook (fetch)', () =>
                context.with(suppressTracing(context.active()), async () => {
                    const webhookResponse = await fetch(webhook, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            text: 'Ny tilbakemelding fra pilotbruker',
                            blocks: [
                                {
                                    type: 'header',
                                    text: { type: 'plain_text', text: header, emoji: true },
                                },
                                {
                                    type: 'section',
                                    text: { type: 'mrkdwn', text: body.data.message },
                                },
                                {
                                    type: 'context',
                                    elements: [{ type: 'plain_text', text: author, emoji: true }],
                                },
                            ],
                        }),
                    })

                    return webhookResponse
                }),
            )
            if (response.ok) return 'ok'

            failSpan(
                span,
                'Slack feedback webhook failed',
                new Error('Slack feedback webhook failed', { cause: new Error(await response.text()) }),
            )
            return { message: 'Feil ved sending av tilbakemelding (mot Slack)', code: 500 }
        } catch (e) {
            failSpan(span, 'Slack feedback webhook failed', new Error('Slack feedback webhook failed', { cause: e }))
            return { message: 'Feil ved sending av tilbakemelding (mot Slack)', code: 500 }
        }
    })
}

function typeEmoji(type: Feedback['type']): string {
    switch (type) {
        case 'FEIL':
            return '🐛'
        case 'FORSLAG':
            return '💡'
        case 'ANNET':
            return '📝'
    }
}
