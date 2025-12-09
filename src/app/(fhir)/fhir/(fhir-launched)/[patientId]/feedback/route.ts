import { NextRequest } from 'next/server'
import * as z from 'zod'
import { context } from '@opentelemetry/api'
import { suppressTracing } from '@opentelemetry/core'

import { getReadyClient } from '@data-layer/fhir/smart/ready-client'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { getServerEnv } from '@lib/env'
import { getNameFromFhir } from '@data-layer/fhir/mappers/patient'
import { failSpan, spanServerAsync } from '@lib/otel/server'

type Feedback = z.infer<typeof feedbackSchema>
const feedbackSchema = z.object({
    type: z.enum(['FEIL', 'FORSLAG', 'ANNET']),
    message: z.string(),
})

export async function POST(
    request: NextRequest,
    { params }: RouteContext<'/fhir/[patientId]/feedback'>,
): Promise<Response> {
    return spanServerAsync('PilotFeedback.POST', async (span) => {
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

        const body = feedbackSchema.safeParse(await request.json())
        if (!body.success) {
            failSpan(
                span,
                'Invalid pilot feedback format',
                new Error('Invalid pilot feedback format', { cause: body.error }),
            )
            return Response.json({ message: 'Feil format på tilbakemeldingen' }, { status: 400 })
        }

        const webhook = getServerEnv().pilotFeedbackSlackWebhook
        if (!webhook) {
            failSpan(span, 'Pilot feedback webhook not configured')
            return Response.json({ message: 'Pilot-feedback er ikke konfigurert' }, { status: 500 })
        }

        const header = `Tilbakemelding fra pilotbruker (${body.data.type.toLowerCase()} ${typeEmoji(body.data.type)})`
        const author = `Fra ${getNameFromFhir(practitioner.name)}, kl ${new Date().toLocaleTimeString('nb-NO', {
            timeZone: 'Europe/Oslo',
        })}`

        try {
            const response = await context.with(suppressTracing(context.active()), async () => {
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
            })

            if (response.ok) {
                return Response.json({ ok: 'ok' }, { status: 200 })
            }

            failSpan(
                span,
                'Slack feedback webhook failed',
                new Error('Slack feedback webhook failed', { cause: new Error(await response.text()) }),
            )
            return Response.json({ message: 'Feil ved sending av tilbakemelding (mot Slack)' }, { status: 500 })
        } catch (e) {
            failSpan(span, 'Slack feedback webhook failed', new Error('Slack feedback webhook failed', { cause: e }))
            return Response.json({ message: 'Feil ved sending av tilbakemelding (mot Slack)' }, { status: 500 })
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
