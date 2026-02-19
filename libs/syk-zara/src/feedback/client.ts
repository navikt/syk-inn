import * as z from 'zod'
import Valkey from 'iovalkey'

import { feedbackValkeyKey } from '../lib/keys'
import { createFeedbackPubClient } from '../pubsub/pub'

import { ContactTypeSchema, ContactableUserFeedback, InSituFeedback } from './schema/schema'

type InSituFeedbackPayload = z.infer<typeof InSituFeedbackPayloadSchema>
const InSituFeedbackPayloadSchema = z.object({
    type: z.literal('IN_SITU'),
    message: z.string().nonempty(),
    variant: z.enum(['Kvittering']),
    user: z.object({
        name: z.string().nonempty(),
        hpr: z.string().nonempty(),
    }),
    sentiment: z.number().min(1).max(5).nullable(),
    meta: z.object({
        system: z.string().nonempty(),
        location: z.string().nonempty().nullable(),
        tags: z.array(z.string()).optional(),
        dev: z.record(z.string(), z.string().nullish()).optional(),
    }),
})

type FullFeedbackPayload = z.infer<typeof FullFeedbackPayloadSchema>
const FullFeedbackPayloadSchema = z.object({
    type: z.literal('FULL'),
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
        dev: z.record(z.string(), z.string().nullish()).optional(),
    }),
})

export type FeedbackClient = {
    create: (id: string, feedback: FullFeedbackPayload | InSituFeedbackPayload) => Promise<void>
    sentiment: (id: string, sentiment: number) => Promise<void>
}

export function createFeedbackClient(valkey: Valkey): FeedbackClient {
    const pub = createFeedbackPubClient(valkey)

    return {
        create: async (id, feedback) => {
            const key = feedbackValkeyKey(id)

            if (await valkey.exists(key)) {
                throw new Error(`Feedback with id ${id} already exists`)
            }

            const payload = z
                .discriminatedUnion('type', [FullFeedbackPayloadSchema, InSituFeedbackPayloadSchema])
                .parse(feedback)
            const timestamp = new Date().toISOString()
            switch (payload.type) {
                case 'IN_SITU':
                    await valkey.hset(key, {
                        id: id,
                        type: 'IN_SITU',
                        timestamp: timestamp,
                        message: payload.message,
                        sentiment: payload.sentiment,
                        variant: payload.variant,
                        name: payload.user.name,
                        uid: payload.user.hpr,
                        verifiedContentAt: null,
                        verifiedContentBy: null,
                        sharedAt: null,
                        sharedBy: null,
                        sharedLink: null,
                        redactionLog: JSON.stringify([]),
                        metaLocation: payload.meta.location,
                        metaSystem: payload.meta.system,
                        metaTags: JSON.stringify(payload.meta.tags ?? []),
                        metaDev: JSON.stringify(payload.meta.dev ?? {}),
                        // TODO: Expand this if we'll use it it more than syk-inn
                        metaSource: 'syk-inn',
                    } satisfies Record<keyof InSituFeedback, string | number | null>)
                    break
                case 'FULL':
                    await valkey.hset(key, {
                        id: id,
                        type: 'CONTACTABLE',
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
                        sharedAt: null,
                        sharedBy: null,
                        sharedLink: null,
                        redactionLog: JSON.stringify([]),
                        metaLocation: payload.meta.location,
                        metaSystem: payload.meta.system,
                        metaTags: JSON.stringify(payload.meta.tags ?? []),
                        metaDev: JSON.stringify(payload.meta.dev ?? {}),
                        // TODO: Expand this if we'll use it it more than syk-inn
                        metaSource: 'syk-inn',
                    } satisfies Record<keyof ContactableUserFeedback, string | number | null>)
                    break
            }

            pub.new(id)
        },
        sentiment: async (id, sentiment) => {
            const key = feedbackValkeyKey(id)
            const exists = await valkey.exists(key)
            if (exists !== 1) {
                throw new Error(`Feedback with id ${id} does not exist`)
            }

            await valkey.hset(key, {
                sentiment: sentiment,
            })

            pub.update(id)
        },
    }
}
