import { createFeedbackClient, FeedbackClient } from '@navikt/syk-zara/feedback'
import { productionValkey } from '@core/services/valkey/client'

export function getFeedbackClient(): FeedbackClient {
    return createFeedbackClient(productionValkey())
}
