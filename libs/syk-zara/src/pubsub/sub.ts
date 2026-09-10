import { logger } from '@navikt/pino-logger'
import { GlideClient, GlideClientConfiguration, type PubSubMsg } from '@valkey/valkey-glide'

import { FEEDBACK_PUBSUB_CHANNELS } from './channels'

export type FeedbackSubClient = (
    config: GlideClientConfiguration,
    channels: {
        new?: (id: string) => Promise<void>
        updated?: (id: string) => Promise<void>
        deleted?: (id: string) => Promise<void>
    },
) => Promise<() => Promise<void>>

/**
 * Subscribe to one or more feedback-related channels.
 *
 * Unlike iovalkey, glide requires subscriptions to be declared when the connection is created, which is why this
 * takes a client _configuration_ and not a client. A subscribing connection can not be used for regular commands,
 * so this always creates (and owns) its own dedicated connection.
 *
 * Returns a function that can be called to unsubscribe from the channels and close the connection. Use it!
 */
export const subscribeToFeedbackChannels: FeedbackSubClient = async (config, channels) => {
    const toSubscribeTo = [
        channels.new != null ? FEEDBACK_PUBSUB_CHANNELS.NEW : null,
        channels.updated != null ? FEEDBACK_PUBSUB_CHANNELS.UPDATED : null,
        channels.deleted != null ? FEEDBACK_PUBSUB_CHANNELS.DELETED : null,
    ].filter((it) => it != null)

    const handler = (msg: PubSubMsg): void => {
        const channel = String(msg.channel)
        const message = String(msg.message)

        const handled: Promise<void> | null = (() => {
            switch (channel) {
                case FEEDBACK_PUBSUB_CHANNELS.NEW:
                    return channels.new?.(message) ?? null
                case FEEDBACK_PUBSUB_CHANNELS.UPDATED:
                    return channels.updated?.(message) ?? null
                case FEEDBACK_PUBSUB_CHANNELS.DELETED:
                    return channels.deleted?.(message) ?? null
                default:
                    // Irrelevant channel
                    return null
            }
        })()

        handled?.catch((error) => logger.error(error, `Failed to handle pubsub message on channel ${channel}`))
    }

    logger.info(`Setting up subscriptions to ${toSubscribeTo.join(', ')}`)
    const subValkey = await GlideClient.createClient({
        ...config,
        pubsubSubscriptions: {
            channelsAndPatterns: {
                [GlideClientConfiguration.PubSubChannelModes.Exact]: new Set(toSubscribeTo),
            },
            callback: handler,
        },
    })

    return async () => {
        subValkey.close()
    }
}
