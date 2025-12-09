import { NextRequest } from 'next/server'
import * as z from 'zod'
import { logger } from '@navikt/next-logger'

import { getReadyClient } from '@data-layer/fhir/smart/ready-client'
import { getHpr } from '@data-layer/fhir/mappers/practitioner'
import { getServerEnv } from '@lib/env'
import { getNameFromFhir } from '@data-layer/fhir/mappers/patient'

type Feedback = z.infer<typeof feedbackSchema>
const feedbackSchema = z.object({
    type: z.enum(['FEIL', 'FORSLAG', 'ANNET']),
    message: z.string(),
})

export async function POST(
    request: NextRequest,
    { params }: RouteContext<'/fhir/[patientId]/feedback'>,
): Promise<Response> {
    const { patientId } = await params
    const client = await getReadyClient(patientId)
    if ('error' in client) {
        return Response.json({ message: client.error }, { status: 500 })
    }
    const practitioner = await client.user.request()
    if ('error' in practitioner) {
        return Response.json({ message: practitioner.error }, { status: 500 })
    }

    const hpr = getHpr(practitioner.identifier)
    if (hpr == null) {
        return Response.json({ message: 'Vi fant ikke et gyldig HPR nummer' }, { status: 500 })
    }

    const body = feedbackSchema.safeParse(await request.json())
    if (!body.success) {
        logger.error(new Error('Invalid pilot feedback format', { cause: body.error }))
        return Response.json({ message: 'Feil format på tilbakemeldingen' }, { status: 400 })
    }

    const webhook = getServerEnv().pilotFeedbackSlackWebhook
    if (!webhook) {
        return Response.json({ message: 'Pilot-feedback er ikke konfigurert' }, { status: 500 })
    }

    const header = `Tilbakemelding fra pilotbruker (${body.data.type.toLowerCase()} ${typeEmoji(body.data.type)})`
    const author = `Fra ${getNameFromFhir(practitioner.name)}, kl ${new Date().toLocaleTimeString('nb-NO')}`

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

    if (webhookResponse.ok) {
        return Response.json({ ok: 'ok' }, { status: 200 })
    }

    logger.error(new Error('Slack feedback webhook failed', { cause: new Error(await webhookResponse.text()) }))
    return Response.json({ message: 'Feil ved sending av tilbakemelding (mot Slack)' }, { status: 500 })
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
