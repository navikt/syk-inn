import { logger } from '@navikt/pino-logger'
import type Valkey from 'iovalkey'

import { FEEDBACK_PUBSUB_CHANNELS } from './channels'

type FeedbackSubClient = (
    valkey: Valkey,
    channels: {
        new?: (id: string) => Promise<void>
        updated?: (id: string) => Promise<void>
        deleted?: (id: string) => Promise<void>
    },
) => Promise<() => Promise<void>>

/**
 * Subscribe to one or more feedback-related channels.
 *
 * Returns a function that can be called to unsubscribe from the channels and/or clean-up. Use it!
 */
export const subscribeToFeedbackChannels: FeedbackSubClient = async (subValkey: Valkey, channels) => {
    const toSubscribeTo = [
        channels.new != null ? FEEDBACK_PUBSUB_CHANNELS.NEW : null,
        channels.updated != null ? FEEDBACK_PUBSUB_CHANNELS.UPDATED : null,
        channels.deleted != null ? FEEDBACK_PUBSUB_CHANNELS.DELETED : null,
    ].filter((it) => it != null)

    logger.info(`Setting up subscriptions to ${toSubscribeTo.join(', ')}`)
    await subValkey.subscribe(...toSubscribeTo)

    const handler = async (channel: string, message: string): Promise<void> => {
        switch (channel) {
            case FEEDBACK_PUBSUB_CHANNELS.NEW:
                if (channels.new) await channels.new(message)
                break
            case FEEDBACK_PUBSUB_CHANNELS.UPDATED:
                if (channels.updated) await channels.updated(message)
                break
            case FEEDBACK_PUBSUB_CHANNELS.DELETED:
                if (channels.deleted) await channels.deleted(message)
                break
            default:
                // Irrelevant channel
                break
        }
    }

    subValkey.on('message', handler)

    return async () => {
        subValkey.removeListener('message', handler)

        await subValkey.unsubscribe()
    }
}
