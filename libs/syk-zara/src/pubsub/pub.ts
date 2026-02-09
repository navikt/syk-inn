import Valkey from 'iovalkey'

import { FEEDBACK_PUBSUB_CHANNELS } from './channels'

type FeedbackPubClient = {
    new: (id: string) => Promise<void>
    update: (id: string) => Promise<void>
    deleted: (id: string) => Promise<void>
}

export const createFeedbackPubClient = (valkey: Valkey): FeedbackPubClient => {
    return {
        new: async (id) => {
            await valkey.publish(FEEDBACK_PUBSUB_CHANNELS.NEW, id)
        },
        update: async (id) => {
            await valkey.publish(FEEDBACK_PUBSUB_CHANNELS.UPDATED, id)
        },
        deleted: async (id) => {
            await valkey.publish(FEEDBACK_PUBSUB_CHANNELS.DELETED, id)
        },
    }
}
