import type { GlideClient, GlideString } from '@valkey/valkey-glide'
import * as R from 'remeda'

import { feedbackValkeyKey } from '../../lib/keys'
import { raise } from '../../lib/utils'
import { hashToRecord, scanKeys, toHashData } from '../../lib/valkey'
import { createFeedbackPubClient } from '../../pubsub/pub'
import { FeedbackClient } from '../client'
import { createFeedbackClient } from '../client'
import { AllFeedbackVariantsSchema, Feedback } from '../schema/schema'

export type AdminFeedbackClient = FeedbackClient & {
    /**
     * Not to be confused with create, this allows you to insert feedback directly,
     * for example when seeding the valkey.
     */
    insert: (id: string, feedback: Omit<Feedback, 'id'>) => Promise<void>
    delete: (id: string) => Promise<void>
    all: () => Promise<Feedback[]>
    byId: (id: string) => Promise<Feedback | null>
    redactFeedback: (id: string, message: string, whom: { name: string; count: number }) => Promise<void>
    mark: {
        verified: (id: string, by: string) => Promise<void>
        contacted: (id: string, by: string) => Promise<void>
        shared: (id: string, by: string, link: string) => Promise<void>
    }
}

/**
 * Admin feedback client for publishing and subscribing to feedback-related events.
 *
 * Note that subscribing requires its own dedicated connection, see `subscribeToFeedbackChannels`.
 */
export function createAdminFeedbackClient(valkey: GlideClient): AdminFeedbackClient {
    const pub = createFeedbackPubClient(valkey)

    return {
        ...createFeedbackClient(valkey),
        insert: async (id, feedback) => {
            const key = feedbackValkeyKey(id)

            await valkey.hset(
                key,
                toHashData({
                    id: id,
                    ...feedback,
                    redactionLog: JSON.stringify(feedback.redactionLog ?? []),
                    metaTags: JSON.stringify(feedback.metaTags ?? []),
                    metaDev: JSON.stringify(feedback.metaDev ?? {}),
                } satisfies Record<keyof Feedback, string | number | null>),
            )

            await pub.new(id)
        },
        all: async () => {
            const allKeys = await scanKeys(valkey, `feedback:*`)
            const feedback = await Promise.all(
                allKeys.map(async (key) => AllFeedbackVariantsSchema.parse(hashToRecord(await valkey.hgetall(key)))),
            )

            return R.sortBy(feedback, [(it) => it.timestamp, 'desc'])
        },
        byId: async (id) => {
            const key = feedbackValkeyKey(id)

            const data = hashToRecord(await valkey.hgetall(key))
            if (Object.keys(data).length === 0) {
                return null
            }

            return AllFeedbackVariantsSchema.parse(data)
        },
        delete: async (id) => {
            const key = feedbackValkeyKey(id)

            /**
             * `DEL` already tells us how many keys were removed, so the previous `EXISTS` round trip
             * was both redundant and racy.
             */
            const deleted = await valkey.del([key])
            if (deleted === 0) return

            await pub.deleted(id)
        },
        redactFeedback: async (id, message, whom) => {
            const key = feedbackValkeyKey(id)
            const existingRedactionLog = await valkey.hget(key, 'redactionLog')
            const redactionLog = existingRedactionLog ? JSON.parse(String(existingRedactionLog)) : []
            redactionLog.push({
                name: whom.name,
                count: whom.count,
                timestamp: new Date().toISOString(),
            })

            await valkey.hset(
                key,
                toHashData({
                    message,
                    redactionLog: JSON.stringify(redactionLog),
                }),
            )

            await pub.update(id)
        },
        mark: {
            verified: async (id, by) => {
                const key = feedbackValkeyKey(id)
                const existingAt = toStringOrNull(await valkey.hget(key, 'verifiedContentAt'))
                if (existingAt) {
                    raise(`Unable to mark feedback as verified, it was already verified at ${existingAt}`)
                }

                await valkey.hset(
                    key,
                    toHashData({
                        verifiedContentAt: new Date().toISOString(),
                        verifiedContentBy: by,
                    }),
                )

                await pub.update(id)
            },
            contacted: async (id, by) => {
                const key = feedbackValkeyKey(id)
                // Both fields live in the same hash, so fetch them in a single round trip
                const [existingAtRaw, typeRaw] = await valkey.hmget(key, ['contactedAt', 'type'])
                const existingAt = toStringOrNull(existingAtRaw)
                const type = toStringOrNull(typeRaw)
                if (existingAt) {
                    raise(`Unable to mark feedback as contacted, it was already contacted at ${existingAt}`)
                }
                if (type !== 'CONTACTABLE') {
                    raise(`Unable to mark feedback as contacted, only CONTACTABLE feedback can be marked as contacted.`)
                }

                await valkey.hset(
                    key,
                    toHashData({
                        contactedAt: new Date().toISOString(),
                        contactedBy: by,
                    }),
                )

                await pub.update(id)
            },
            shared: async (id, by, link) => {
                const key = feedbackValkeyKey(id)
                const existingAt = toStringOrNull(await valkey.hget(key, 'sharedAt'))
                if (existingAt) {
                    raise(`Unable to mark feedback as shared, it was already shared at ${existingAt}`)
                }

                await valkey.hset(
                    key,
                    toHashData({
                        sharedAt: new Date().toISOString(),
                        sharedBy: by,
                        sharedLink: link,
                    }),
                )

                await pub.update(id)
            },
        },
    }
}

function toStringOrNull(value: GlideString | null): string | null {
    return value == null ? null : String(value)
}
