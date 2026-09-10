import { GlideClient } from '@valkey/valkey-glide'

import { FEEDBACK_PUBSUB_CHANNELS } from './channels'

type FeedbackPubClient = {
    new: (id: string) => Promise<void>
    update: (id: string) => Promise<void>
    deleted: (id: string) => Promise<void>
}

/**
 * All of these events should be triggered internally in clients, and should never have
 * to be exposed to the consumers of this library.
 *
 * Note: glide's `publish` takes the message first, then the channel.
 */
export const createFeedbackPubClient = (valkey: GlideClient): FeedbackPubClient => {
    return {
        new: async (id) => {
            await valkey.publish(id, FEEDBACK_PUBSUB_CHANNELS.NEW)
        },
        update: async (id) => {
            await valkey.publish(id, FEEDBACK_PUBSUB_CHANNELS.UPDATED)
        },
        deleted: async (id) => {
            await valkey.publish(id, FEEDBACK_PUBSUB_CHANNELS.DELETED)
        },
    }
}
