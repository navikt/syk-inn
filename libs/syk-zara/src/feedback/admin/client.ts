import type { GlideClient, GlideString } from '@valkey/valkey-glide'
import * as R from 'remeda'

import { feedbackValkeyKey } from '../../lib/keys'
import { spanServerAsync } from '../../lib/otel'
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
        insert: async (id, feedback) =>
            spanServerAsync('AdminFeedbackClient.insert', async () => {
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
            }),
        all: async () =>
            spanServerAsync('AdminFeedbackClient.all', async () => {
                const allKeys = await scanKeys(valkey, `feedback:*`)
                const feedback = await Promise.all(
                    allKeys.map(async (key) =>
                        AllFeedbackVariantsSchema.parse(hashToRecord(await valkey.hgetall(key))),
                    ),
                )

                return R.sortBy(feedback, [(it) => it.timestamp, 'desc'])
            }),
        byId: async (id) =>
            spanServerAsync('AdminFeedbackClient.byId', async () => {
                const key = feedbackValkeyKey(id)

                const data = hashToRecord(await valkey.hgetall(key))
                if (Object.keys(data).length === 0) {
                    return null
                }

                return AllFeedbackVariantsSchema.parse(data)
            }),
        delete: async (id) =>
            spanServerAsync('AdminFeedbackClient.delete', async () => {
                const key = feedbackValkeyKey(id)

                const deleted = await valkey.del([key])
                if (deleted === 0) return

                await pub.deleted(id)
            }),
        redactFeedback: async (id, message, whom) =>
            spanServerAsync('AdminFeedbackClient.redactFeedback', async () => {
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
            }),
        mark: {
            verified: async (id, by) =>
                spanServerAsync('AdminFeedbackClient.mark.verified', async () => {
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
                }),
            contacted: async (id, by) =>
                spanServerAsync('AdminFeedbackClient.mark.contacted', async () => {
                    const key = feedbackValkeyKey(id)
                    const [existingAtRaw, typeRaw] = await valkey.hmget(key, ['contactedAt', 'type'])
                    const existingAt = toStringOrNull(existingAtRaw)
                    const type = toStringOrNull(typeRaw)
                    if (existingAt) {
                        raise(`Unable to mark feedback as contacted, it was already contacted at ${existingAt}`)
                    }
                    if (type !== 'CONTACTABLE') {
                        raise(
                            `Unable to mark feedback as contacted, only CONTACTABLE feedback can be marked as contacted.`,
                        )
                    }

                    await valkey.hset(
                        key,
                        toHashData({
                            contactedAt: new Date().toISOString(),
                            contactedBy: by,
                        }),
                    )

                    await pub.update(id)
                }),
            shared: async (id, by, link) =>
                spanServerAsync('AdminFeedbackClient.mark.shared', async () => {
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
                }),
        },
    }
}

function toStringOrNull(value: GlideString | null): string | null {
    return value == null ? null : String(value)
}
