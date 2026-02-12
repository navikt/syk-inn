import type Valkey from 'iovalkey'
import * as R from 'remeda'

import { FeedbackClient } from '../client'
import { feedbackValkeyKey } from '../lib/keys'
import { AllFeedbackVariantsSchema, Feedback } from '../schema/schema'
import { raise } from '../lib/utils'
import { createFeedbackClient } from '../client'
import { createFeedbackPubClient } from '../pubsub/pub'

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
 * You will need to provide two instances of Valkey connections, as subscriptions cannot share the same connection
 * as normal R/W operations or publish operations.
 */
export function createAdminFeedbackClient(valkey: Valkey): AdminFeedbackClient {
    const pub = createFeedbackPubClient(valkey)

    return {
        ...createFeedbackClient(valkey),
        insert: async (id, feedback) => {
            const key = feedbackValkeyKey(id)

            await valkey.hset(key, {
                id: id,
                ...feedback,
                redactionLog: JSON.stringify(feedback.redactionLog ?? []),
                metaTags: JSON.stringify(feedback.metaTags ?? []),
                metaDev: JSON.stringify(feedback.metaDev ?? {}),
            } satisfies Record<keyof Feedback, string | number | null>)

            pub.new(id)
        },
        all: async () => {
            const allkeys = await valkey.keys(`feedback:*`)
            const feedback = await Promise.all(
                allkeys.map(async (key) => {
                    const data = await valkey.hgetall(key)

                    return AllFeedbackVariantsSchema.parse(data)
                }),
            )

            return R.sortBy(feedback, [(it) => it.timestamp, 'desc'])
        },
        byId: async (id) => {
            const key = feedbackValkeyKey(id)

            const data = await valkey.hgetall(key)
            if (Object.keys(data).length === 0) {
                return null
            }

            return AllFeedbackVariantsSchema.parse(data)
        },
        delete: async (id) => {
            const key = feedbackValkeyKey(id)

            const exists = await valkey.exists(key)
            if (exists !== 1) return

            await valkey.del(key)

            pub.deleted(id)
        },
        redactFeedback: async (id, message, whom) => {
            const key = feedbackValkeyKey(id)
            const existingRedactionLog = await valkey.hget(key, 'redactionLog')
            const redactionLog = existingRedactionLog ? JSON.parse(existingRedactionLog) : []
            redactionLog.push({
                name: whom.name,
                count: whom.count,
                timestamp: new Date().toISOString(),
            })

            await valkey.hset(key, {
                message,
                redactionLog: JSON.stringify(redactionLog),
            })

            pub.update(id)
        },
        mark: {
            verified: async (id, by) => {
                const key = feedbackValkeyKey(id)
                const existingAt = await valkey.hget(key, 'verifiedContentAt')
                if (existingAt) {
                    raise(`Unable to mark feedback as verified, it was already verified at ${existingAt}`)
                }

                await valkey.hset(key, {
                    verifiedContentAt: new Date().toISOString(),
                    verifiedContentBy: by,
                })

                pub.update(id)
            },
            contacted: async (id, by) => {
                const key = feedbackValkeyKey(id)
                const existingAt = await valkey.hget(key, 'contactedAt')
                if (existingAt) {
                    raise(`Unable to mark feedback as contacted, it was already contacted at ${existingAt}`)
                }

                await valkey.hset(key, {
                    contactedAt: new Date().toISOString(),
                    contactedBy: by,
                })

                pub.update(id)
            },
            shared: async (id, by, link) => {
                const key = feedbackValkeyKey(id)
                const existingAt = await valkey.hget(key, 'sharedAt')
                if (existingAt) {
                    raise(`Unable to mark feedback as shared, it was already shared at ${existingAt}`)
                }

                await valkey.hset(key, {
                    sharedAt: new Date().toISOString(),
                    sharedBy: by,
                    sharedLink: link,
                })

                pub.update(id)
            },
        },
    }
}
