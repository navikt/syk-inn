import * as z from 'zod'

import { failSpan, spanServerAsync } from '@lib/otel/server'
import { shouldUseMockEngine } from '@dev/mock-engine'
import { getServerEnv } from '@lib/env'

import {
    feedbackUpdateSentimmentPayloadSchema,
    fullFeedbackPayloadSchema,
    inSituFeedbackPayloadSchema,
} from './feedback-payload'
import { getFeedbackClient } from './feedback-client'

export async function handleV2Feedback(
    json: unknown,
    meta: { name: string; hpr: string; system: string },
): Promise<{ feedbackId: string } | { message: string; code: number }> {
    return spanServerAsync('Feedback.handleV2Feedback', async (span) => {
        const payload = z
            .discriminatedUnion('feedbackType', [
                fullFeedbackPayloadSchema,
                feedbackUpdateSentimmentPayloadSchema,
                inSituFeedbackPayloadSchema,
            ])
            .safeParse(json)
        if (!payload.success) {
            failSpan(span, 'Invalid feedback payload', payload.error)
            return { message: 'Feil format på tilbakemeldingen', code: 400 }
        }

        if (shouldUseMockEngine() && !getServerEnv().useLocalValkey) {
            return { feedbackId: crypto.randomUUID() }
        }

        const feedbackClient = getFeedbackClient()
        switch (payload.data.feedbackType) {
            case 'SENTIMENT_UPDATE': {
                await feedbackClient.sentiment(payload.data.id, payload.data.sentiment)

                return { feedbackId: payload.data.id }
            }
            case 'IN_SITU': {
                const uuid = crypto.randomUUID()
                await feedbackClient.create(uuid, {
                    type: 'IN_SITU',
                    message: payload.data.message,
                    sentiment: payload.data.sentiment,
                    variant: payload.data.variant,
                    user: {
                        name: meta.name,
                        hpr: meta.hpr,
                    },
                    meta: {
                        tags: [],
                        location: payload.data.meta.location,
                        dev: payload.data.meta.dev,
                        system: meta.system,
                    },
                })
                return { feedbackId: uuid }
            }
            case 'FULL': {
                const uuid = crypto.randomUUID()
                await feedbackClient.create(uuid, {
                    type: 'FULL',
                    category: payload.data.type,
                    message: payload.data.message,
                    sentiment: null,
                    user: {
                        name: meta.name,
                        hpr: meta.hpr,
                    },
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

                return { feedbackId: uuid }
            }
        }
    })
}
