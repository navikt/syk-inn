import * as z from 'zod'
import Valkey from 'iovalkey'

import { ContactTypeSchema, Feedback } from './lib/schema'
import { feedbackValkeyKey } from './lib/keys'
import { createFeedbackPubClient } from './pubsub/pub'

type FeedbackPayload = z.infer<typeof FeedbackPayloadSchema>
const FeedbackPayloadSchema = z.object({
    message: z.string().nonempty(),
    user: z.object({
        name: z.string().nonempty(),
        hpr: z.string().nonempty(),
    }),
    sentiment: z.number().min(1).max(5).nullable(),
    category: z.enum(['FEIL', 'FORSLAG', 'ANNET']),
    contact: z.object({
        type: ContactTypeSchema,
        details: z.string().nonempty().nullable(),
    }),
    meta: z.object({
        system: z.string().nonempty(),
        location: z.string().nonempty().nullable(),
        tags: z.array(z.string()).optional(),
        dev: z.record(z.string(), z.string()).optional(),
    }),
})

export type FeedbackClient = {
    create: (id: string, feedback: FeedbackPayload) => Promise<void>
}

export function createFeedbackClient(valkey: Valkey): FeedbackClient {
    const pub = createFeedbackPubClient(valkey)

    return {
        create: async (id, feedback) => {
            const payload = FeedbackPayloadSchema.parse(feedback)
            const key = feedbackValkeyKey(id)
            const timestamp = new Date().toISOString()

            await valkey.hset(key, {
                id: id,
                timestamp: timestamp,
                message: payload.message,
                name: payload.user.name,
                uid: payload.user.hpr,
                category: payload.category,
                sentiment: payload.sentiment,
                contactType: payload.contact.type,
                contactDetails: payload.contact.details,
                verifiedContentAt: null,
                verifiedContentBy: null,
                contactedAt: null,
                contactedBy: null,
                redactionLog: JSON.stringify([]),
                metaLocation: payload.meta.location,
                metaTags: JSON.stringify(payload.meta.tags ?? []),
                metaDev: JSON.stringify(payload.meta.dev ?? {}),
                // TODO: Expand this if we'll use it it more than syk-inn
                metaSource: 'syk-inn',
            } satisfies Record<keyof Feedback, string | number | null>)

            pub.new(id)
        },
    }
}
