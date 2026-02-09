import * as z from 'zod'
import Valkey from 'iovalkey'

import { ContactTypeSchema, Feedback } from './lib/schema'
import { feedbackValkeyKey } from './lib/keys'
import { createFeedbackPubClient } from './pubsub/pub'

type FeedbackPayload = z.infer<typeof FeedbackPayloadSchema>
const FeedbackPayloadSchema = z.object({
    message: z.string().nonempty(),
    name: z.string().nonempty(),
    contact: z.object({
        type: ContactTypeSchema,
        details: z.string().nonempty().nullable(),
    }),
    meta: z.object({
        source: z.string().nonempty(),
        tags: z.array(z.string()),
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
                name: payload.name,
                contactType: payload.contact.type,
                contactDetails: payload.contact.details,
                verifiedContentAt: null,
                verifiedContentBy: null,
                contactedAt: null,
                contactedBy: null,
                redactionLog: JSON.stringify([]),
                metaSource: payload.meta.source,
                metaTags: JSON.stringify(payload.meta.tags),
            } satisfies Record<keyof Feedback, unknown>)

            pub.new(id)
        },
    }
}
